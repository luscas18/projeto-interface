import { supabaseClient } from "./client"

export async function updateQuantidade(id: number, novaQuantidade: number) {
  const { data, error } = await supabaseClient
    .from('Movimentacao')
    .update({ quantidade: novaQuantidade })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Erro ao atualizar:', error)
    return { error }
  }

  console.log('Registro atualizado:', data)
  return { data }
}