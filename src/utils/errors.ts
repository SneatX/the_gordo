const DB_ERROR_MAP: { pattern: RegExp; message: string }[] = [
  {
    pattern: /duplicate key.*restaurant_tables_number_key/i,
    message: 'Ya existe una mesa con ese número.',
  },
  {
    pattern: /duplicate key.*schedules/i,
    message: 'Ya existe un horario para ese día.',
  },
  {
    pattern: /duplicate key.*locations/i,
    message: 'Ya existe una ubicación con ese nombre.',
  },
  {
    pattern: /duplicate key/i,
    message: 'Ya existe un registro con esos datos.',
  },
  {
    pattern: /violates foreign key constraint/i,
    message: 'No se puede eliminar porque tiene registros asociados.',
  },
  {
    pattern: /null value in column.*violates not-null/i,
    message: 'Hay campos obligatorios sin completar.',
  },
  {
    pattern: /value too long for type/i,
    message: 'Uno de los valores ingresados es demasiado largo.',
  },
  {
    pattern: /invalid input syntax for type/i,
    message: 'El formato de algún campo es inválido.',
  },
  {
    pattern: /no rows found|PGRST116/i,
    message: 'No se encontró el registro.',
  },
  {
    pattern: /permission denied|RLS/i,
    message: 'No tienes permisos para realizar esta acción.',
  },
  {
    pattern: /connection|network|fetch/i,
    message: 'Error de conexión. Verifica tu internet e intenta de nuevo.',
  },
]

export function translateError(err: string): string {
  for (const { pattern, message } of DB_ERROR_MAP) {
    if (pattern.test(err)) return message
  }
  return err
}
