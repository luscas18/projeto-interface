'use client'
import { useEffect, useState } from 'react'
import { supabaseClient } from './utils/supabase/client'
import Image from 'next/image'
import UpdateMovimentacaoPage from './update/page'

type EstatisticaDiaria = {
  id: number
  data: string
  entradas: number
  saidas: number
}

export default function EstatisticaLoja() {
  const [estatisticaHoje, setEstatisticaHoje] = useState<EstatisticaDiaria | null>(null)
  const [historico, setHistorico] = useState<EstatisticaDiaria[]>([])
  const images = ['/opt.png', '/opt1.png', '/opt3.png']

  useEffect(() => {
    const fetchInitial = async () => {
      // 🔹 1. Busca dados de hoje
      const hoje = new Date().toISOString().split('T')[0]
      const { data: estatData, error: estatError } = await supabaseClient
        .from('EstatisticaDiaria')
        .select('*')
        .eq('data', hoje)
        .maybeSingle()

      if (estatError) console.error('Erro ao buscar estatística do dia:', estatError)
      else setEstatisticaHoje(estatData)

      // 🔹 2. Busca histórico completo (últimos dias)
      const { data: histData, error: histError } = await supabaseClient
        .from('EstatisticaDiaria')
        .select('*')
        .order('data', { ascending: false })

      if (histError) console.error('Erro ao buscar histórico:', histError)
      else setHistorico(histData || [])
    }

    fetchInitial()

    // === ESCUTA mudanças em tempo real na tabela EstatisticaDiaria ===
    const estatChannel = supabaseClient
      .channel('realtime:estatistica')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'EstatisticaDiaria' },
        async () => {
          const hoje = new Date().toISOString().split('T')[0]
          const { data: estatData } = await supabaseClient
            .from('EstatisticaDiaria')
            .select('*')
            .eq('data', hoje)
            .maybeSingle()
          setEstatisticaHoje(estatData)

          const { data: histData } = await supabaseClient
            .from('EstatisticaDiaria')
            .select('*')
            .order('data', { ascending: false })
          setHistorico(histData || [])
        }
      )
      .subscribe()

    return () => {
      supabaseClient.removeChannel(estatChannel)
    }
  }, [])

  // === Quantidade atual = entradas - saídas ===
  const quantidadeAtual =
    estatisticaHoje ? estatisticaHoje.entradas - estatisticaHoje.saidas : 0

  // === Renderiza imagens das pessoas dentro ===
  const renderImages = () => {
    if (quantidadeAtual <= 0) return null

    return Array.from({ length: quantidadeAtual }, (_, i) => {
      const img = images[Math.floor(Math.random() * images.length)]
      return (
        <div
          key={i}
          className="relative w-[150px] h-[300px] m-2 inline-block animate-fade-bottom"
        >
          <Image src={img} alt={`pessoa-${i}`} fill className="object-contain" />
        </div>
      )
    })
  }

  // === Painel de estatísticas do dia ===
  const renderPainel = () => (
    <div className="absolute top-0 left-0 bg-white/90 text-black p-6 text-xl rounded-br-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-3">📊 Estatísticas de Hoje</h2>
      <p>👥 Pessoas na loja: <strong>{quantidadeAtual}</strong></p>
      <p>
        Fluxo total: <strong>{(estatisticaHoje?.entradas ?? 0)}</strong>
      </p>
    </div>
  )

  // === Tabela de histórico ===
  const renderTabela = () => (
    <div className="w-full p-6 bg-white/90 text-black mt-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">📅 Histórico de Movimento</h2>
      <table className="w-full border-collapse border border-gray-400">
        <thead className="bg-gray-200">
          <tr>
            <th className="border border-gray-400 p-2">Data</th>
            <th className="border border-gray-400 p-2">Entradas</th>
            <th className="border border-gray-400 p-2">Saídas</th>
          </tr>
        </thead>
        <tbody>
          {historico.length > 0 ? (
            historico.map((item) => (
              <tr key={item.id} className="text-center hover:bg-gray-100">
                <td className="border border-gray-400 p-2">
                  {new Date(item.data).toLocaleDateString('pt-BR')}
                </td>
                <td className="border border-gray-400 p-2">{item.entradas}</td>
                <td className="border border-gray-400 p-2">{item.saidas}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center p-3 text-gray-500">
                Nenhum registro encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      {/* Seção principal */}
      <section className="relative w-full min-h-screen bg-[url(/caixa.png)] bg-cover bg-bottom flex flex-wrap justify-center items-end">
        {renderImages()}
        {renderPainel()}
      </section>

      {/* Histórico de dias */}
      {renderTabela()}
    </>
  )
}
