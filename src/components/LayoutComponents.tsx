import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Calendar, Clock, CreditCard, FileText, User } from "lucide-react";
import logoUrl from "../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faPhone } from "@fortawesome/free-solid-svg-icons";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

function focarProximoCampo(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key !== "Enter") return;
  e.preventDefault();

  const campos = Array.from(
    document.querySelectorAll<HTMLInputElement>("input"),
  ).filter((el) => !el.closest('[aria-hidden="true"]'));

  const indiceAtual = campos.indexOf(e.currentTarget);
  const proximo = campos[indiceAtual + 1];
  proximo?.focus();
  proximo?.select();
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function LinhaContato({
  icone,
  children,
}: {
  icone: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-white bg-primary p-1 rounded-full ">
        {icone}
      </span>
      <span className="text-primary font-medium text-base">{children}</span>
    </div>
  );
}

export function Cabecalho() {
  return (
    <div>
      <div className="flex items-stretch gap-6 pb-6">
        <div className="flex items-center shrink-0">
          <img src={logoUrl} alt="Logo" className="h-50" />
        </div>

        <div className="w-px bg-gray-200 self-stretch" />

        <div className="">
          <div className="flex flex-col justify-center gap-1 items-center">
            <div>
              <h1 className="text-sm font-bold text-primary uppercase tracking-tighter">
                CNPJ 59.59.585.110/0001-05
              </h1>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span className="flex-1 h-px bg-secondary-dark" />
              <span className="text-secondary-dark text-[10px]">◆</span>
              <span className="flex-1 h-px bg-secondary-dark" />
            </div>
            <h1 className="text-2xl font-bold text-primary uppercase tracking-tighter">
              Grunwald Art Em Ferro
            </h1>
            <div className="flex items-center gap-2 w-full">
              <span className="flex-1 h-px bg-secondary-dark" />
              <span className="text-secondary-dark text-[10px]">◆</span>
              <span className="flex-1 h-px bg-secondary-dark" />
            </div>
          </div>
          <div className="space-y-3">
            <LinhaContato
              icone={
                <FontAwesomeIcon icon={faPhone} className="rounded-full " />
              }
            >
              (41) 99222-9737
            </LinhaContato>
            <LinhaContato
              icone={
                <FontAwesomeIcon className="w-5 h-10 " icon={faLocationDot} />
              }
            >
              Curitiba – PR
            </LinhaContato>
            <LinhaContato icone={<FontAwesomeIcon icon={faInstagram} />}>
              @grunwaldartemferro
            </LinhaContato>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden my-6 py-7 border-primary border">
        <div className="absolute left-0 top-0 h-full w-36 sm:w-44">
          <div
            className="absolute inset-0 bg-secondary-dark"
            style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
          />
          <div
            className="absolute inset-0 bg-primary"
            style={{ clipPath: "polygon(0 0, 65% 0, 0 100%)" }}
          />
        </div>
        <div className="absolute right-0 top-0 h-full w-36 sm:w-44">
          <div
            className="absolute inset-0 bg-secondary-dark"
            style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
          />
          <div
            className="absolute inset-0 bg-primary"
            style={{ clipPath: "polygon(100% 0, 35% 100%, 100% 100%)" }}
          />
        </div>

        <div className="relative flex flex-col items-center gap-2">
          <h2 className="flex items-center gap-4 text-3xl sm:text-4xl font-serif font-bold text-primary uppercase tracking-wide">
            Orçamento
          </h2>
          <div className="flex items-center gap-2 w-40">
            <span className="flex-1 h-px bg-secondary-dark" />
            <span className="text-secondary-dark text-xs">◆</span>
            <span className="flex-1 h-px bg-secondary-dark" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function InfoCliente({
  cliente,
  setCliente,
  validade,
  setValidade,
  dataEmissao,
}: {
  cliente: string;
  setCliente: (v: string) => void;
  validade: string;
  setValidade: (v: string) => void;
  dataEmissao: string;
}) {
  return (
    <div className="mb-8 text-sm flex items-stretch divide-x divide-gray-200">
      <div className="flex-1 flex items-center gap-3 pr-6 min-w-0">
        <span className="shrink-0 w-11 h-11 rounded-full bg-primary text-secondary flex items-center justify-center">
          <User className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <span className="block text-xs font-bold text-primary uppercase tracking-wide">
            Cliente:
          </span>
          <input
            type="text"
            onKeyDown={focarProximoCampo}
            value={cliente}
            placeholder="Cliente..."
            onChange={(e) => setCliente(e.target.value)}
            style={{ width: `${Math.max(cliente.length, 10)}ch` }}
            className="font-semibold text-gray-800 bg-transparent border-b border-gray-300 hover:border-primary focus:border-primary outline-none max-w-full py-0.5"
          />
        </div>
      </div>
      <div className="flex-1 flex items-center gap-3 px-6 min-w-0">
        <span className="shrink-0 w-11 h-11 rounded-lg bg-primary text-secondary flex items-center justify-center">
          <Calendar className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <span className="block text-xs f ont-bold text-primary uppercase tracking-wide">
            Data:
          </span>
          <p className="text-gray-800 font-medium border-b border-gray-300 py-0.5">
            {dataEmissao}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-3 pl-5 min-w-0">
        <span className="shrink-0 w-11 h-11 rounded-full  bg-primary text-secondary-dark flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <span className="block text-xs font-bold text-primary uppercase tracking-wide">
            Validade do orçamento:
          </span>
          <input
            type="text"
            onKeyDown={focarProximoCampo}
            value={validade}
            placeholder="Validade..."
            onChange={(e) => setValidade(e.target.value)}
            style={{ width: `${Math.max(validade.length, 4)}ch` }}
            className="text-gray-800 font-medium bg-transparent border-b border-gray-300 hover:border-primary focus:border-primary outline-none max-w-full py-0.5"
          />
        </div>
      </div>
    </div>
  );
}
export function Colunas() {
  return (
    <colgroup>
      <col style={{ width: "8%" }} />
      <col style={{ width: "34%" }} />
      <col style={{ width: "10%" }} />
      <col style={{ width: "17%" }} />
      <col style={{ width: "17%" }} />
      <col style={{ width: "14%" }} />
    </colgroup>
  );
}
export function TabelaHead() {
  return (
    <thead>
      <tr className="bg-primary text-secondary text-xs font-bold uppercase tracking-wide">
        <th className="py-3 pl-2 text-center">Item</th>
        <th className="py-3 pr-2 pl-2">Descrição</th>
        <th className="py-3 text-center">Qntd.</th>
        <th className="py-3 text-center">Valor Unit.</th>
        <th className="py-3 text-center">Valor Total</th>
        <th className="py-3 text-center print:hidden"></th>
      </tr>
    </thead>
  );
}
export function BlocoTotais({
  totalGeral,
  observacao,
  setObservacao,
  observacaoSelecionada,
  pagamento,
  setPagamento,
  pagamentoSelecionado,
}: {
  subtotal: number;
  descontoPorcentagem: number;
  setDescontoPorcentagem: (v: number) => void;
  totalGeral: number;
  observacao: string;
  setObservacao: (v: string) => void;
  observacaoSelecionada: boolean;
  pagamento: string;
  setPagamento: (v: string) => void;
  pagamentoSelecionado: boolean;
}) {
  const observacaoRef = useRef<HTMLTextAreaElement>(null);
  const pagamentoRef = useRef<HTMLTextAreaElement>(null);

  const ajustarAltura = (el: HTMLTextAreaElement | null) => {
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    ajustarAltura(observacaoRef.current);
    ajustarAltura(pagamentoRef.current);
  }, [observacao, pagamento]);

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      {/* =====================================================
          TOTAL
      ===================================================== */}
      <div className="flex justify-end w-full">
        <div className="flex items-stretch overflow-hidden border border-primary">
          {/* TOTAL */}
          <div className="bg-primary text-secondary font-bold uppercase text-xs sm:text-sm px-4 sm:px-6 py-2 flex items-center tracking-wide">
            Total
          </div>

          {/* VALOR */}
          <div className="flex items-center justify-end px-4 sm:px-6 py-2">
            <span className="text-lg sm:text-2xl font-bold text-primary whitespace-nowrap">
              {formatarMoeda(totalGeral)}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          OBSERVAÇÃO
          Só renderiza se estiver selecionada
      ===================================================== */}
      {observacaoSelecionada && (
        <div className="w-full min-w-0">
          {/* Divisor */}

          <div className="flex items-start gap-3 w-full">
            {/* Ícone */}
            <span className="shrink-0 w-9 h-9 rounded-full bg-primary text-secondary flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-primary uppercase mb-1">
                Observação:
              </p>

              <textarea
                ref={observacaoRef}
                rows={1}
                value={observacao}
                onChange={(e) => {
                  setObservacao(e.target.value);
                  ajustarAltura(e.target);
                }}
                className=" w-full min-w-0 bg-transparent border-transparent overflow-hidden text-gray-800 leading-relaxed text-sm block outline-none p-0 resize-none wrap-break-word whitespace-pre-wrap hover:border-primary focus:border-primary "
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FORMA DE PAGAMENTO
          Só renderiza se estiver selecionada
      ===================================================== */}
      {pagamentoSelecionado && (
        <div className="w-full min-w-0">
          {/* Divisor */}

          <div className="flex items-start gap-3 w-full">
            {/* Ícone */}
            <span className="shrink-0 w-9 h-9 rounded-full bg-primary text-secondary flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-primary uppercase mb-1">
                Forma de Pagamento:
              </p>

              <textarea
                ref={pagamentoRef}
                rows={1}
                value={pagamento}
                onChange={(e) => {
                  setPagamento(e.target.value);
                  ajustarAltura(e.target);
                }}
                className=" w-full min-w-0 bg-transparent border-transparent overflow-hidden text-gray-800 leading-relaxed text-sm block outline-none p-0 resize-none wrap-break-word whitespace-pre-wrap hover:border-primary focus:border-primary "
              />
            </div>
          </div>
          {/* Divisor */}
        </div>
      )}
    </div>
  );
}

export function Rodape() {
  return (
    <div className="border-t border-gray-200 pt-3 text-center mt-auto">
      <p className="text-[10px] text-gray-400 font-medium tracking-wide">
        Grunwald Em Art Ferro • (41) 99222-9737 • @grunwaldartemferro
      </p>
    </div>
  );
}
