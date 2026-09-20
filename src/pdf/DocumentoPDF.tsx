import { useRef, useLayoutEffect, useMemo } from "react";

import { Cabecalho } from "../components/LayoutComponents";

import {
  BlocoTotais,
  Colunas,
  InfoCliente,
  LinhaItem,
  TabelaHead,
} from "./PDFComponents";

interface Item {
  id: string;
  descricao: string;
  quantidade: number;
  preco: number;
}

interface Pagina {
  itemIds: string[];
  comTotais: boolean;
}

const PAGE_WIDTH = 750;
const PAGE_HEIGHT = Math.round((PAGE_WIDTH * 297) / 210);
const PAGE_PADDING = 48;
const MARGEM_SEGURANCA = PAGE_PADDING * 0.2;
const PAGE_CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PADDING * 2.5 - MARGEM_SEGURANCA;

interface DocumentoPDFProps {
  cliente: string;
  validade: string;
  descontoPorcentagem: number;
  itens: Item[];
  paginas: Pagina[];
  setPaginas: React.Dispatch<React.SetStateAction<Pagina[]>>;
  pageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onReady?: () => void;
  observacao: string;
  pagamento: string;
}

export default function DocumentoPDF({
  cliente,
  validade,
  descontoPorcentagem,
  itens,
  paginas,
  setPaginas,
  pageRefs,
  onReady,
  observacao,
  pagamento,
}: DocumentoPDFProps) {
  const dataEmissao = useMemo(() => new Date().toLocaleDateString("pt-BR"), []);
  const prontoRef = useRef(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const theadRef = useRef<HTMLDivElement>(null);
  const totaisRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

  const paginasIguais = (a: Pagina[], b: Pagina[]) => {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (a[i].comTotais !== b[i].comTotais) {
        return false;
      }

      if (a[i].itemIds.length !== b[i].itemIds.length) {
        return false;
      }

      for (let j = 0; j < a[i].itemIds.length; j++) {
        if (a[i].itemIds[j] !== b[i].itemIds[j]) {
          return false;
        }
      }
    }

    return true;
  };

  const subtotal = useMemo(() => {
    return itens.reduce(
      (acc, item) =>
        acc + Number(item.quantidade || 0) * Number(item.preco || 0),
      0,
    );
  }, [itens]);

  const valorDesconto = (subtotal * descontoPorcentagem) / 100;
  const totalGeral = subtotal - valorDesconto;

  const itensMap = useMemo(() => {
    return new Map(itens.map((item) => [item.id, item]));
  }, [itens]);

  const itensIndexMap = useMemo(() => {
    return new Map(itens.map((item, idx) => [item.id, idx]));
  }, [itens]);

  useLayoutEffect(() => {
    const headerH = headerRef.current?.offsetHeight ?? 0;
    const infoH = infoRef.current?.offsetHeight ?? 0;
    const theadH = theadRef.current?.offsetHeight ?? 0;
    const totaisH = totaisRef.current?.offsetHeight ?? 0;
    const espacoDisponivel = (primeiraPagina: boolean) => {
      let base = PAGE_CONTENT_HEIGHT - theadH;
      if (primeiraPagina) {
        base -= headerH + infoH;
      }
      return base;
    };
    const novasPaginas: Pagina[] = [];
    let itemIdsAtual: string[] = [];
    let usados = 0;
    let disponivel = espacoDisponivel(true);

    for (const item of itens) {
      const altura = rowRefs.current.get(item.id)?.offsetHeight ?? 40;

      if (itemIdsAtual.length > 0 && usados + altura > disponivel) {
        novasPaginas.push({
          itemIds: itemIdsAtual,
          comTotais: false,
        });

        itemIdsAtual = [];
        usados = 0;
        disponivel = espacoDisponivel(false);
      }
      itemIdsAtual.push(item.id);
      usados += altura;
    }

    const cabemTotais = usados + totaisH <= disponivel;
    novasPaginas.push({
      itemIds: itemIdsAtual,
      comTotais: cabemTotais,
    });

    if (!cabemTotais) {
      novasPaginas.push({
        itemIds: [],
        comTotais: true,
      });
    }

    setPaginas((atual) => {
      if (paginasIguais(atual, novasPaginas)) {
        return atual;
      }

      return novasPaginas;
    });
  }, [itens, cliente, validade, descontoPorcentagem, setPaginas]);

  useLayoutEffect(() => {
    if (paginas.length === 0) {
      return;
    }

    if (prontoRef.current) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const todasRenderizadas = paginas.every(
        (_, index) => pageRefs.current[index],
      );

      if (todasRenderizadas) {
        prontoRef.current = true;
        onReady?.();
      }
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [paginas, onReady, pageRefs]);

  return (
    <div className="min-h-screen bg-gray-200 p-4sm:p-8 flex  flex-col  items-center ">
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: -99999,
          width: PAGE_WIDTH,
          padding: PAGE_PADDING,
          visibility: "hidden",
          pointerEvents: "none",
        }}
      >
        <div ref={headerRef}>
          <Cabecalho />
        </div>

        <div ref={infoRef}>
          <InfoCliente
            cliente={cliente}
            validade={validade}
            dataEmissao={dataEmissao}
          />
        </div>

        <div ref={theadRef}>
          <table className="w-full text-left text-sm table-fixed">
            <Colunas />
            <TabelaHead />
          </table>
        </div>

        <table className="w-full text-left text-sm table-fixed border-collapse">
          <Colunas />
          <TabelaHead />
          <tbody>
            {itens.map((item, idx) => (
              <LinhaItem
                key={item.id}
                item={item}
                index={idx}
                ref={(el) => {
                  if (el) {
                    rowRefs.current.set(item.id, el);
                  } else {
                    rowRefs.current.delete(item.id);
                  }
                }}
              />
            ))}
          </tbody>
        </table>

        <div ref={totaisRef}>
          <BlocoTotais
            subtotal={subtotal}
            descontoPorcentagem={descontoPorcentagem}
            totalGeral={totalGeral}
            observacao={observacao}
            pagamento={pagamento}
          />
        </div>
      </div>

      {paginas.map((pagina, idx) => (
        <div
          key={idx}
          className="mb-8 last:mb-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className=" flex items-center gap-3 mb-2 text-gray-400 select-none print:hidden">
            <span className="font-semibold">
              Página {idx + 1}
              {paginas.length > 1 ? ` de ${paginas.length}` : ""}
            </span>

            <div className="flex-1 border-t border-dashed border-gray-300" />
          </div>

          <div
            style={{
              overflow: "hidden",
            }}
          >
            <div
              ref={(el) => {
                pageRefs.current[idx] = el;
              }}
              style={{
                width: PAGE_WIDTH,
                height: PAGE_HEIGHT,
                padding: PAGE_PADDING,
                transformOrigin: "top left",
              }}
              className="bg-white shadow-2xl flex flex-col font-sans text-gray-800 "
            >
              <div className="flex-1 flex flex-col overflow-hidden">
                {idx === 0 && <Cabecalho />}
                {idx === 0 && (
                  <InfoCliente
                    cliente={cliente}
                    validade={validade}
                    dataEmissao={dataEmissao}
                  />
                )}
                {pagina.itemIds.length > 0 && (
                  <table className="w-full text-left text-sm table-fixed mb-2">
                    <Colunas />
                    <TabelaHead />

                    <tbody className="divide-y divide-gray-100">
                      {pagina.itemIds.map((id) => {
                        const item = itensMap.get(id);

                        if (!item) {
                          return null;
                        }

                        const idxOriginal = itensIndexMap.get(id) ?? 0;

                        return (
                          <LinhaItem key={id} item={item} index={idxOriginal} />
                        );
                      })}
                    </tbody>
                  </table>
                )}
                {pagina.comTotais && (
                  <BlocoTotais
                    subtotal={subtotal}
                    descontoPorcentagem={descontoPorcentagem}
                    totalGeral={totalGeral}
                    observacao={observacao}
                    pagamento={pagamento}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
