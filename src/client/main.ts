import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Account
} from '@solana/web3.js';

class SolanaRandomNumberClient {
  private connection: Connection;
  private programId: PublicKey;
  private payer: Account; // La cuenta que realiza las transacciones y paga las tarifas

  constructor(connectionUrl: string, programId: string, payerAccount: Account) {
    this.connection = new Connection(connectionUrl, 'recent');
    this.programId = new PublicKey(programId);
    this.payer = payerAccount;
  }

  async generateRandomNumber(targetAccountPublicKey: string): Promise<number> {
    const targetAccount = new PublicKey(targetAccountPublicKey);

    // Crear una transacción que invoque el contrato para generar un número aleatorio
    const transaction = new Transaction().add(
        new TransactionInstruction({
          programId: this.programId,
          keys: [
            { pubkey: this.payer.publicKey, isSigner: true, isWritable: true },
            { pubkey: targetAccount, isSigner: false, isWritable: true },
          ],
          data: Buffer.from([]), // Datos de instrucción (vacíos en este caso)
        })
    );

    // Firmar y enviar la transacción
    await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.payer], // Firma de la cuenta pagadora
        { commitment: 'singleGossip', preflightCommitment: 'singleGossip' } // Confirmación
    );

    // Consultar la cuenta objetivo para obtener el número aleatorio generado
    const targetAccountInfo = await this.connection.getAccountInfo(targetAccount);
    if (!targetAccountInfo) {
      throw new Error('La cuenta objetivo no existe o está vacía');
    }

    // Analizar los datos de la cuenta para obtener el número aleatorio
    const randomData = Buffer.from(targetAccountInfo.data);
    const randomValue = randomData.readUInt32LE(0); // Leer un entero sin signo de 32 bits en little-endian

    return randomValue;
  }
}

// Uso del cliente
const connectionUrl = 'https://api.devnet.solana.com'; // URL de la red Solana Devnet
const programId = 'programIdHere'; // Reemplaza con la clave pública del programa
const payerAccount = new Account(Buffer.from('payerPrivateKeyHere', 'hex')); // Reemplaza con la clave privada de la cuenta pagadora

const client = new SolanaRandomNumberClient(connectionUrl, programId, payerAccount);
const targetAccountPublicKey = 'targetAccountPublicKeyHere'; // Reemplaza con la clave pública de la cuenta objetivo

client.generateRandomNumber(targetAccountPublicKey)
    .then(randomNumber => {
      console.log(`Número aleatorio generado: ${randomNumber}`);
    })
    .catch(error => {
      console.error('Error:', error);
    });