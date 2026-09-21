import { forwardRef } from "react";
import { Calendar, Clock, CreditCard, FileText, User } from "lucide-react";

interface Item {
  id: string;
  descricao: string;
  quantidade: number;
  preco: number;
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function TextArea({ value }: { value: string }) {
  return (
    <div className=" w-full bg-transparent p-1 text-gray-800 leading-relaxed text-sm block whitespace-pre-wrap wrap-break-word overflow-wrap-anywhere ">
      {value}
    </div>
  );
}

export function InfoCliente({
  cliente,
  validade,
  dataEmissao,
}: {
  cliente: string;
  validade: string;
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
          <div className="font-semibold text-gray-800 max-w-full wrap-break-word overflow-wrap-anywhere border-b border-gray-300 py-0.5">
            {cliente}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-3 px-6 min-w-0">
        <span className="shrink-0 w-11 h-11 rounded-lg bg-primary text-secondary flex items-center justify-center">
          <Calendar className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <span className="block text-xs font-bold text-primary uppercase tracking-wide">
            Data:
          </span>
          <p className="text-gray-800 font-medium border-b border-gray-300 py-0.5">
            {dataEmissao}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-3 pl-6 min-w-0">
        <span className="shrink-0 w-11 h-11 rounded-full bg-primary text-secondary-dark flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <span className="block text-xs font-bold text-primary uppercase tracking-wide">
            Validade do orçamento:
          </span>
          <div className="text-gray-800 font-medium max-w-full wrap-break-word overflow-wrap-anywhere border-b border-gray-300 py-0.5">
            {validade}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Colunas() {
  return (
    <colgroup>
      <col style={{ width: "9%" }} />
      <col style={{ width: "39%" }} />
      <col style={{ width: "12%" }} />
      <col style={{ width: "20%" }} />
      <col style={{ width: "20%" }} />
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
      </tr>
    </thead>
  );
}

export const LinhaItem = forwardRef<
  HTMLTableRowElement,
  {
    item: Item;
    index: number;
    selecionada?: boolean;
  }
>(function LinhaItem({ item, index, selecionada = false }, ref) {
  const totalItem = Number(item.quantidade || 0) * Number(item.preco || 0);
  const numero = String(index + 1).padStart(2, "0");

  return (
    <tr
      ref={ref}
      className={`align-middle ${
        selecionada ? "bg-secondary" : index % 2 === 0 ? "bg-secondary/40" : ""
      }`}
    >
      <td className="py-3 pl-2 text-center align-middle font-bold text-primary text-sm border border-secondary-dark">
        {numero}
      </td>
      <td className="py-3 pl-2 pr-3 align-middle border border-secondary-dark">
        <TextArea value={item.descricao} />
      </td>

      <td className="py-3 text-center align-middle px-1 border border-secondary-dark">
        <div className="flex items-center justify-center h-full">
          {item.quantidade}
        </div>
      </td>

      <td className="py-3 text-center align-middle px-1 border border-secondary-dark">
        <div className="flex items-center justify-center h-full whitespace-nowrap">
          <span className="text-sm font-medium text-gray-800 mr-1">R$</span>
          <div className="font-medium text-gray-800 whitespace-nowrap">
            {Number(item.preco || 0).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </td>

      <td className="py-3 text-center font-medium text-gray-800 align-middle whitespace-nowrap px-1 border border-secondary-dark">
        <div className="flex items-center justify-center h-full font-bold">
          {formatarMoeda(totalItem)}
        </div>
      </td>
    </tr>
  );
});

export function BlocoTotais({
  totalGeral,
  observacao,
  pagamento,
}: {
  subtotal: number;
  descontoPorcentagem: number;
  totalGeral: number;
  observacao: string;
  pagamento: string;
}) {
  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      {/* =====================================================
          TOTAL
      ===================================================== */}
      <div className="flex justify-end w-full">
        <div className="flex items-stretch overflow-hidden border border-primary">
          {/* TOTAL */}
          <div className="bg-primary text-secondary font-bold uppercase text-xs sm:text-sm px-4 sm:px-6 py-2 flex items-center tracking-wide shrink-0">
            Total
          </div>

          {/* VALOR */}
          <div className="flex items-center justify-end px-4 sm:px-6 py-2 min-w-37.5">
            <span className="text-lg sm:text-2xl font-bold text-primary whitespace-nowrap">
              {formatarMoeda(totalGeral)}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          OBSERVAÇÃO
      ===================================================== */}
      <div className="w-full min-w-0">
        <div className="flex items-start gap-3 w-full">
          {/* Ícone */}
          <span className="shrink-0 w-9 h-9 rounded-full bg-primary text-secondary flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-primary uppercase mb-1">
              Observação:
            </p>

            <div className="w-full min-w-0 text-gray-800 leading-relaxed text-sm block p-0 whitespace-pre-wrap wrap-break-word overflow-wrap-anywhere">
              {observacao}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full min-w-0">
        <div className="flex items-start gap-3 w-full">
          <span className="shrink-0 w-9 h-9 rounded-full bg-primary text-secondary flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-primary uppercase mb-1">
              Forma de Pagamento:
            </p>

            <div className="w-full min-w-0 text-gray-800 leading-relaxed text-sm block p-0 whitespace-pre-wrap wrap-break-word overflow-wrap-anywhere">
              {pagamento}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
