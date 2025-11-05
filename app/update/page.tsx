'use client'

import { useState } from 'react'
import { updateQuantidade } from '../utils/supabase/update'

export default function UpdateMovimentacaoPage() {
  const [quantidade, setQuantidade] = useState<number>(0)
  const [status, setStatus] = useState<string>('')

  const handleUpdate = async () => {
    setStatus('Atualizando...')
    const { error } = await updateQuantidade(1, quantidade)

    if (error) {
      setStatus('❌ Erro ao atualizar!')
      console.error(error)
    } else {
      setStatus('✅ Atualizado com sucesso!')
    }
  }

  return (
    <div className="flex flex-col gap-4 p-6 max-w-sm mx-auto">
      <h2 className="text-xl font-semibold text-center">
        Atualizar quantidade da Movimentação ID 1
      </h2>

      <input
        type="number"
        value={quantidade}
        onChange={(e) => setQuantidade(Number(e.target.value))}
        className="border border-gray-300 rounded-lg p-2 text-center"
        placeholder="Digite a nova quantidade"
      />

      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Enviar
      </button>

      {status && <p className="text-center text-sm">{status}</p>}
    </div>
  )
}
