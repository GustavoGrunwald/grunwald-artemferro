import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { toPng } from "html-to-image";
import { LinhaItem } from "./components/TableComponents";
import {
  BlocoTotais,
  Cabecalho,
  Colunas,
  InfoCliente,
  TabelaHead,
} from "./components/LayoutComponents";
import {
  CreditCard,
  FileDown,
  FileText,
  LucideBrushCleaning,
  Plus,
  Trash2,
} from "lucide-react";
import DocumentoPDF from "./pdf/DocumentoPDF";

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

interface DadosSalvos {
  cliente: string;
  validade: string;
  descontoPorcentagem: number;
  itens: Item[];
  observacao: string;
  pagamento: string;
}

const PAGE_WIDTH = 750;
const PAGE_HEIGHT = Math.round((PAGE_WIDTH * 297) / 210);
const PAGE_PADDING = 48;
const MARGEM_SEGURANCA = PAGE_PADDING * 0.2;
const PAGE_CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PADDING * 2.5 - MARGEM_SEGURANCA;
function computeDisplayScale() {
  if (typeof window === "undefined") return 1;
  const disponivel = window.innerWidth - 32;
  return Math.min(1, disponivel / PAGE_WIDTH);
}

const STORAGE_KEY = "orcamento-grunwald:v1";

function carregarDadosSalvos(): DadosSalvos | null {
  try {
    const bruto = localStorage.getItem(STORAGE_KEY);
    return bruto ? (JSON.parse(bruto) as DadosSalvos) : null;
  } catch {
    return null;
  }
}

const ITEM_INICIAL: Item = {
  id: "1",
  descricao: "",
  quantidade: 1,
  preco: 100,
};

export default function App() {
  const dadosSalvos = carregarDadosSalvos();
  const [cliente, setCliente] = useState(dadosSalvos?.cliente ?? "");
  const [validade, setValidade] = useState(dadosSalvos?.validade ?? "15 dias");
  const [dataEmissao] = useState(new Date().toLocaleDateString("pt-BR"));
  const [descontoPorcentagem, setDescontoPorcentagem] = useState<number>(
    dadosSalvos?.descontoPorcentagem ?? 0,
  );
  const [linhaSelecionada, setLinhaSelecionada] = useState<string | null>(null);

  const [itens, setItens] = useState<Item[]>(
    dadosSalvos?.itens ?? [ITEM_INICIAL],
  );
  const [observacao, setObservacao] = useState(dadosSalvos?.observacao ?? "");
  const [observacaoSelecionada, setObservaçaoSelecionada] = useState(
    observacao.length == 0 ? false : true,
  );

  const [pagamento, setPagamento] = useState(dadosSalvos?.pagamento ?? "");
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState(
    pagamento.length == 0 ? false : true,
  );

  useEffect(() => {
    const dados: DadosSalvos = {
      cliente,
      validade,
      descontoPorcentagem,
      itens,
      observacao,
      pagamento,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  }, [cliente, validade, descontoPorcentagem, itens, observacao, pagamento]);

  const [paginas, setPaginas] = useState<Pagina[]>([
    { itemIds: ["1"], comTotais: true },
  ]);

  const [displayScale, setDisplayScale] = useState<number>(computeDisplayScale);
  useEffect(() => {
    const aoRedimensionar = () => setDisplayScale(computeDisplayScale());
    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, []);

  const headerRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const theadRef = useRef<HTMLDivElement>(null);
  const totaisRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const atualizarItem = (
    id: string,
    campo: keyof Item,
    valor: string | number,
  ) => {
    setItens((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)),
    );
  };

  const adicionarLinha = () => {
    setItens((prev) => [
      ...prev,
      { id: crypto.randomUUID(), descricao: "", quantidade: 1, preco: 0 },
    ]);
  };

  const adicionarObservacao = () => {
    setObservaçaoSelecionada(!observacaoSelecionada);
    setObservacao(!observacaoSelecionada ? "Obs" : "");
  };

  const adicionarFormaPagamento = () => {
    setPagamentoSelecionado(!pagamentoSelecionado);
    setPagamento(!pagamentoSelecionado ? "A combinar" : "");
  };
  const removerLinha = (id: string) => {
    setItens((prev) => prev.filter((item) => item.id !== id));
    setLinhaSelecionada((atual) => (atual === id ? null : atual));
  };

  const limparTudo = () => {
    setItens(() => [
      { id: crypto.randomUUID(), descricao: "", quantidade: 1, preco: 0 },
    ]);
    setPagamentoSelecionado(false);
    setObservaçaoSelecionada(false);
    setPagamento("");
    setObservacao("");
    setCliente("");
  };

  const subtotal = itens.reduce(
    (acc, item) => acc + Number(item.quantidade || 0) * Number(item.preco || 0),
    0,
  );
  const valorDesconto = (subtotal * descontoPorcentagem) / 100;
  const totalGeral = subtotal - valorDesconto;

  function paginasIguais(a: Pagina[], b: Pagina[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].comTotais !== b[i].comTotais) return false;
      if (a[i].itemIds.length !== b[i].itemIds.length) return false;
      for (let j = 0; j < a[i].itemIds.length; j++) {
        if (a[i].itemIds[j] !== b[i].itemIds[j]) return false;
      }
    }
    return true;
  }

  const [medicaoTick, setMedicaoTick] = useState(0);

  const [exportando, setExportando] = useState(false);
  const [paginasPDF, setPaginasPDF] = useState<Pagina[]>([]);

  useEffect(() => {
    const el = totaisRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setMedicaoTick((t) => t + 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const headerH = headerRef.current?.offsetHeight ?? 0;
    const infoH = infoRef.current?.offsetHeight ?? 0;
    const theadH = theadRef.current?.offsetHeight ?? 0;
    const totaisH = totaisRef.current?.offsetHeight ?? 0;

    const espacoDisponivel = (primeiraPagina: boolean) => {
      let base = PAGE_CONTENT_HEIGHT - theadH;
      if (primeiraPagina) base -= headerH + infoH;
      return base;
    };

    const novasPaginas: Pagina[] = [];
    let itemIdsAtual: string[] = [];
    let usados = 0;
    let disponivel = espacoDisponivel(true);

    for (const item of itens) {
      const altura = rowRefs.current.get(item.id)?.offsetHeight ?? 40;

      if (itemIdsAtual.length > 0 && usados + altura > disponivel) {
        novasPaginas.push({ itemIds: itemIdsAtual, comTotais: false });
        itemIdsAtual = [];
        usados = 0;
        disponivel = espacoDisponivel(false);
      }

      itemIdsAtual.push(item.id);
      usados += altura;
    }
    const cabemTotais = usados + totaisH <= disponivel;
    novasPaginas.push({ itemIds: itemIdsAtual, comTotais: cabemTotais });
    if (!cabemTotais) {
      novasPaginas.push({ itemIds: [], comTotais: true });
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPaginas((atual) =>
      paginasIguais(atual, novasPaginas) ? atual : novasPaginas,
    );
  }, [
    itens,
    cliente,
    validade,
    descontoPorcentagem,
    observacao,
    observacaoSelecionada,
    medicaoTick,
  ]);

  const exportarParaPDF = async () => {
    try {
      setExportando(true);

      pageRefs.current = [];
      setPaginasPDF([]);
    } catch (error) {
      console.error("Erro ao iniciar exportação:", error);
      setExportando(false);
    }
  };
  const gerarPDF = async () => {
    try {
      const elementos = pageRefs.current.filter(
        (el): el is HTMLDivElement => el !== null,
      );

      if (elementos.length === 0) {
        console.error("Nenhuma página encontrada.");
        setExportando(false);
        return;
      }

      // Espera o navegador terminar o layout/renderização
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });

      // Espera fontes
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      const { default: jsPDF } = await import("jspdf");

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < elementos.length; i++) {
        const elemento = elementos[i];

        // Garante que o elemento esteja visível e renderizado
        const rect = elemento.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) {
          console.warn(`Página ${i + 1} possui dimensões inválidas.`);
          continue;
        }

        const imgData = await toPng(elemento, {
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          cacheBust: true,
        });

        if (i > 0) {
          pdf.addPage();
        }
        const imgWidth = pdfWidth;
        const imgHeight = pdfHeight;

        pdf.addImage(
          imgData,
          "JPEG",
          0,
          0,
          imgWidth,
          imgHeight,
          undefined,
          "FAST",
        );
      }

      const nomeCliente = cliente?.trim() || "Cliente";

      const nomeArquivo = `Orcamento_${nomeCliente
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "_")}.pdf`;

      const blob = pdf.output("blob");

      const arquivo = new File([blob], nomeArquivo, {
        type: "application/pdf",
      });

      const shareData: ShareData = {
        files: [arquivo],
      };

      // ===================== COMPARTILHAR vs BAIXAR =====================
      // Por padrão, se o navegador suportar a Web Share API com arquivos
      // (a maioria dos celulares), abrimos o menu nativo de compartilhamento/
      // "salvar como" em vez de forçar o download direto.
      //
      // Para DESATIVAR o compartilhamento e sempre forçar o download do PDF,
      // comente (ou apague) todo o bloco "if (navigator.canShare..." abaixo,
      // do início até o seu "}" de fechamento. O código de download logo em
      // seguida (criação do link com URL.createObjectURL) continuará
      // funcionando normalmente sozinho.
      if (navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);

          setExportando(false);
          return;
        } catch (erro) {
          if (erro instanceof Error && erro.name === "AbortError") {
            setExportando(false);
            return;
          }

          throw erro;
        }
      }

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = nomeArquivo;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      setExportando(false);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      setExportando(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-200 p-4 sm:p-8 flex flex-col items-center"
      onClick={() => setLinhaSelecionada(null)}
    >
      <h2 className="text-gray-400">Versão: 1.1</h2>
      <div
        className="flex items-center justify-between pb-4 print:hidden"
        style={{ width: PAGE_WIDTH * displayScale }}
      >
        <div
          className="grid grid-cols-2 gap-2"
          style={{ width: `${Math.max(220, 260 * displayScale)}px` }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              adicionarLinha();
            }}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-md transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Item</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              limparTudo();
            }}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-red-800 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-md transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <LucideBrushCleaning className="w-4 h-4 shrink-0" />
            <span>Limpar</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              adicionarObservacao();
            }}
            className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-white text-xs sm:text-sm font-semibold rounded-md transition-all shadow-sm cursor-pointer active:scale-95 ${
              observacaoSelecionada
                ? "bg-red-800 hover:bg-red-700"
                : "bg-blue-700 hover:bg-blue-600"
            }`}
          >
            {observacaoSelecionada ? (
              <>
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Obs</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 shrink-0" />
                <span>Obs</span>
              </>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              adicionarFormaPagamento();
            }}
            className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-white text-xs sm:text-sm font-semibold rounded-md transition-all shadow-sm cursor-pointer active:scale-95 ${
              pagamentoSelecionado
                ? "bg-red-800 hover:bg-red-700"
                : "bg-blue-700 hover:bg-blue-600"
            }`}
          >
            {pagamentoSelecionado ? (
              <>
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Pagto</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>Pagto</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={exportarParaPDF}
          disabled={exportando}
          className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-amber-900 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm hover:bg-amber-800 active:scale-[0.98] transition-all cursor-pointer"
        >
          <FileDown className="w-4 h-4 shrink-0" />
          <span> {exportando ? "Gerando..." : "Criar PDF"}</span>
        </button>
      </div>
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
            setCliente={setCliente}
            validade={validade}
            setValidade={setValidade}
            dataEmissao={dataEmissao}
          />
        </div>
        <div ref={theadRef}>
          <table className="w-full text-left text-sm table-fixed">
            <Colunas />
            <TabelaHead />
          </table>
        </div>
        <table className="w-full text-left text-sm table-fixed">
          <Colunas />
          <tbody className="">
            {itens.map((item, idx) => (
              <LinhaItem
                key={item.id}
                item={item}
                index={idx}
                onChange={atualizarItem}
                onRemove={removerLinha}
                ref={(el) => {
                  if (el) rowRefs.current.set(item.id, el);
                  else rowRefs.current.delete(item.id);
                }}
              />
            ))}
          </tbody>
        </table>
        <div ref={totaisRef}>
          <BlocoTotais
            subtotal={subtotal}
            descontoPorcentagem={descontoPorcentagem}
            setDescontoPorcentagem={setDescontoPorcentagem}
            totalGeral={totalGeral}
            observacao={observacao}
            setObservacao={setObservacao}
            observacaoSelecionada={observacaoSelecionada}
            pagamento={pagamento}
            setPagamento={setPagamento}
            pagamentoSelecionado={pagamentoSelecionado}
          />
        </div>
      </div>

      {paginas.map((pagina, idx) => (
        <div
          key={idx}
          className="mb-8 last:mb-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-center gap-3 mb-2 text-xs text-gray-400 select-none print:hidden"
            style={{ width: PAGE_WIDTH * displayScale }}
          >
            <span className="font-semibold">
              Página {idx + 1}
              {paginas.length > 1 ? ` de ${paginas.length}` : ""}
            </span>
            <div className="flex-1 border-t border-dashed border-gray-300" />
          </div>
          <div
            style={{
              width: PAGE_WIDTH * displayScale,
              height: PAGE_HEIGHT * displayScale,
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
                transform: `scale(${displayScale})`,
                transformOrigin: "top left",
              }}
              className="bg-white shadow-2xl flex flex-col font-sans text-gray-800"
            >
              <div className="flex-1 flex flex-col overflow-hidden">
                {idx === 0 && <Cabecalho />}
                {idx === 0 && (
                  <InfoCliente
                    cliente={cliente}
                    setCliente={setCliente}
                    validade={validade}
                    setValidade={setValidade}
                    dataEmissao={dataEmissao}
                  />
                )}

                {pagina.itemIds.length > 0 && (
                  <table className="w-full text-left text-sm table-fixed mb-2">
                    <Colunas />
                    <TabelaHead />
                    <tbody className="divide-y divide-gray-100">
                      {pagina.itemIds.map((id) => {
                        const item = itens.find((i) => i.id === id);
                        if (!item) return null;
                        const idxOriginal = itens.findIndex((i) => i.id === id);
                        return (
                          <LinhaItem
                            key={id}
                            item={item}
                            index={idxOriginal}
                            onChange={atualizarItem}
                            onRemove={removerLinha}
                            selecionada={linhaSelecionada === id}
                            onSelect={() => setLinhaSelecionada(id)}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {pagina.comTotais && (
                  <BlocoTotais
                    subtotal={subtotal}
                    descontoPorcentagem={descontoPorcentagem}
                    setDescontoPorcentagem={setDescontoPorcentagem}
                    totalGeral={totalGeral}
                    observacao={observacao}
                    setObservacao={setObservacao}
                    observacaoSelecionada={observacaoSelecionada}
                    pagamento={pagamento}
                    setPagamento={setPagamento}
                    pagamentoSelecionado={pagamentoSelecionado}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      {exportando && (
        <DocumentoPDF
          cliente={cliente}
          validade={validade}
          descontoPorcentagem={descontoPorcentagem}
          itens={itens}
          paginas={paginasPDF}
          setPaginas={setPaginasPDF}
          pageRefs={pageRefs}
          observacao={observacao}
          pagamento={pagamento}
          onReady={gerarPDF}
        />
      )}
    </div>
  );
}
