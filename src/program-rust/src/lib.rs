use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use rand::Rng;

/// Define la estructura de datos del estado almacenado en las cuentas
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
    /// Número aleatorio generado
    pub random_number: u32,
}

// Declara y exporta el punto de entrada (entrypoint) del programa
entrypoint!(process_instruction);

// Implementa la lógica principal del programa en la función process_instruction
pub fn process_instruction(
    _program_id: &Pubkey, // Clave pública de la cuenta donde se cargó el programa
    accounts: &[AccountInfo], // Cuentas involucradas en la transacción
    _instruction_data: &[u8], // Datos de instrucción (ignorados en este caso)
) -> ProgramResult {
    msg!("Punto de entrada del programa Rust de Generación de Número Aleatorio");

    // Obtener la cuenta a la que se va a enviar el número aleatorio
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;

    // Generar un número aleatorio
    let mut rng = rand::thread_rng();
    let random_number = rng.gen_range(1..=100); // Número aleatorio entre 1 y 100

    // Crear una instancia de la estructura GreetingAccount con el número aleatorio
    let greeting_account = GreetingAccount { random_number };

    // Serializar la estructura y almacenarla en los datos de la cuenta
    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("Número aleatorio generado: {}", random_number);

    Ok(())
}