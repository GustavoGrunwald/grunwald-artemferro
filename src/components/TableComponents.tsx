import { forwardRef, useLayoutEffect, useRef } from "react";

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

function focarProximoCampo(
  e: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>,
) {
  if (e.key !== "Enter" || e.shiftKey) return;
  e.preventDefault();

  const campos = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLDivElement>(
      "input, [contenteditable='true']",
    ),
  ).filter((el) => !el.closest('[aria-hidden="true"]'));

  const indiceAtual = campos.indexOf(e.currentTarget);
  const proximo = campos[indiceAtual + 1];
  proximo?.focus();

  if (proximo instanceof HTMLInputElement) proximo.select();
}

export function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ajustarAltura = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  useLayoutEffect(() => {
    ajustarAltura();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={value || ""}
      onChange={(e) => {
        onChange(e);
        ajustarAltura();
      }}
      placeholder={placeholder}
      className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:bg-white p-1 outline-none resize-none overflow-hidden text-gray-800 leading-relaxed text-sm block"
    />
  );
}

export const LinhaItem = forwardRef<
  HTMLTableRowElement,
  {
    item: Item;
    index: number;
    onChange: (id: string, campo: keyof Item, valor: string | number) => void;
    onRemove: (id: string) => void;
    selecionada?: boolean;
    onSelect?: () => void;
  }
>(function LinhaItem(
  { item, index, onChange, onRemove, selecionada = false, onSelect = () => {} },
  ref,
) {
  const totalItem = Number(item.quantidade || 0) * Number(item.preco || 0);
  const numero = String(index + 1).padStart(2, "0");

  return (
    <tr
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`group transition align-center ${
        selecionada
          ? "bg-secondary"
          : index % 2 === 0
            ? "bg-secondary/40 hover:bg-secondary"
            : "hover:bg-secondary"
      }`}
    >
      <td className="py-3 pl-2 pr-1 text-center align-center font-bold text-primary text-sm border border-secondary-dark">
        {numero}
      </td>
      <td className="py-3 pr-3 align-center border border-secondary-dark">
        <AutoResizeTextarea
          placeholder="Descrição..."
          value={item.descricao}
          onChange={(novoTexto) =>
            onChange(item.id, "descricao", novoTexto.target.value)
          }
        />
      </td>
      <td className="py-3 text-center align-center px-1 border border-secondary-dark">
        <div className="flex items-center justify-center h-full">
          <input
            onKeyDown={focarProximoCampo}
            type="number"
            min="1"
            inputMode="numeric"
            value={item.quantidade || ""}
            onChange={(e) =>
              onChange(item.id, "quantidade", Number(e.target.value))
            }
            className="w-full min-w-0 text-center bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:bg-white p-1 rounded outline-none font-medium"
          />
        </div>
      </td>

      <td className="py-3 text-center border border-secondary-dark">
        <div className="flex items-center justify-center h-full">
          <div className="inline-flex items-center border-b border-transparent hover:border-gray-300 focus-within:border-primary focus-within:bg-white rounded transition">
            <span className="text-sm font-medium text-gray-800 mr-0.5 select-none">
              R$
            </span>
            <input
              onKeyDown={focarProximoCampo}
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={item.preco || ""}
              onChange={(e) => onChange(item.id, "preco", e.target.value)}
              style={{
                width: `${Math.max((String(item.preco) || "").length, 4)}ch`,
              }}
              className="bg-transparent outline-none p-0 border-none font-medium text-gray-800 text-center"
            />
          </div>
        </div>
      </td>

      <td className="py-3 text-center font-medium text-gray-800 align-center overflow-hidden text-ellipsis whitespace-nowrap border border-secondary-dark">
        <div className="flex items-center justify-center h-full font-bold">
          {formatarMoeda(totalItem)}
        </div>
      </td>
      <td className="py-3 text-center align-center print:hidden border border-secondary-dark">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className={`text-gray-300 hover:text-red-500 font-bold transition w-8 h-8 flex items-center justify-center mx-auto rounded-full ${
            selecionada
              ? "opacity-100 text-red-500 bg-red-50"
              : "opacity-0 group-hover:opacity-100"
          }`}
          title="Remover"
        >
          ✕
        </button>
      </td>
    </tr>
  );
});
