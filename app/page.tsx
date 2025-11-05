'use client'
import { useEffect, useState } from 'react'
import { supabaseClient } from './utils/supabase/client'
import UpdateMovimentacaoPage from './update/page'
import Image from 'next/image'

type Movimentacao = {
  id: number
  created_at: string
  quantidade: number
}

export default function MovimentacoesLive() {
  const [items, setItems] = useState<Movimentacao[]>([])
  const images = ['/01.png', '/02.png', '/03.png']

  useEffect(() => {
    // 🔹 Carrega os dados iniciais
    const fetchInitial = async () => {
      const { data, error } = await supabaseClient
        .from('Movimentacao') // ❌ removido o tipo genérico
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
      if (error) console.error('Erro ao buscar dados iniciais', error)
      else if (data) setItems(data)
    }
    fetchInitial()

    // 🔹 Escuta mudanças em tempo real na tabela Movimentacao
    const channel = supabaseClient
      .channel('public:Movimentacao')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Movimentacao',
        },
        (payload) => {
          const newRec = payload.new as Movimentacao
          if (newRec) {
            setItems([newRec])
          }
        }
      )
      .subscribe()

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [])

  // 🔹 Renderiza as imagens aleatórias com animação
  const renderImages = () => {
    if (!items.length || items[0].quantidade <= 0) return null

    const quantidade = items[0].quantidade
    const elements = Array.from({ length: quantidade }, (_, i) => {
      const randomIndex = Math.floor(Math.random() * images.length)
      const randomImage = images[randomIndex]

      return (
        <div
          key={i}
          className="relative w-[150px] h-[300px] m-2 inline-block animate-fade-bottom"
        >
          <Image
            src={randomImage}
            alt={`avatar-${i}`}
            fill
            className="object-contain"
          />
        </div>
      )
    })

    return elements
  }

  return (
    <>
      <section className="relative w-full min-h-screen bg-[url(/bg.webp)] bg-cover flex flex-wrap justify-center items-end">
        {renderImages()}
        <div className="absolute top-0 left-0 bg-white text-black p-[20px] text-[50px]">
          {/* Aqui você pode exibir a quantidade atual */}
          {items.length > 0 ? items[0].quantidade : 0}
        </div>
      </section>

      <div>
        <UpdateMovimentacaoPage />
      </div>
    </>
  )
}
