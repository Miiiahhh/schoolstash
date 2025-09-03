import { useState, FormEvent } from "react";
import { supabase } from "../lib/supabase";
import Hero from "../components/Hero";

type Status = "pendente" | "aceito" | "rejeitado";

type NewOrder = {
  requester_name: string;
  item_name: string;
  quantity: number;
  notes: string | null;
  status: Status; // sempre "pendente" na criação pública
  notify_email: string | null;
  notify_phone: string | null;
};

export default function OrdersPublic() {
  const [requesterName, setRequesterName] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyPhone, setNotifyPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function sanitizePhone(v: string) {
    const onlyDigits = v.replace(/\D/g, "");
    return onlyDigits || "";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    const payload: NewOrder = {
      requester_name: requesterName.trim(),
      item_name: itemName.trim(),
      quantity: Number(quantity) || 1,
      notes: notes.trim() ? notes.trim() : null,
      status: "pendente",
      notify_email: notifyEmail.trim() ? notifyEmail.trim() : null,
      notify_phone: notifyPhone.trim() ? sanitizePhone(notifyPhone) : null,
    };

    if (!payload.requester_name || !payload.item_name) {
      setErr("Informe seu nome e o item.");
      return;
    }
    if (payload.quantity <= 0) {
      setErr("Quantidade precisa ser pelo menos 1.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("orders").insert(payload);
    setLoading(false);

    if (error) {
      console.error("Erro ao enviar pedido:", error);
      setErr(error.message ?? "Falha ao enviar pedido. Tente novamente.");
      return;
    }

    setMsg("Pedido enviado com sucesso! 👍");
    setRequesterName("");
    setItemName("");
    setQuantity(1);
    setNotes("");
    setNotifyEmail("");
    setNotifyPhone("");
  }

  return (
    <>
      {/* HERO enxuto */}
      <Hero />

      {/* Conteúdo da página */}
      <div className="container" style={{ padding: 16, maxWidth: 720 }}>
        {/* removido header duplicado */}

        <form
          id="form"
          onSubmit={handleSubmit}
          className="ss-card"
          style={{ display: "grid", gap: 12, padding: 16, marginTop: 12 }}
        >
          <div className="grid" style={{ gap: 12 }}>
            <input
              className="ss-input"
              placeholder="Seu nome"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              required
            />
            <input
              className="ss-input"
              placeholder="Item"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input
                className="ss-input"
                type="number"
                min={1}
                placeholder="Quantidade"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                style={{ maxWidth: 160 }}
                required
              />
              <input
                className="ss-input"
                placeholder="Seu e-mail (para avisos) — opcional"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input
                className="ss-input"
                placeholder="Seu WhatsApp com DDD (apenas números) — opcional"
                value={notifyPhone}
                onChange={(e) => setNotifyPhone(e.target.value)}
              />
              <input
                className="ss-input"
                placeholder="Observações (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="ss-btn" type="submit" disabled={loading}>
              {loading ? "Enviando…" : "Enviar pedido"}
            </button>
            <button
              className="ss-btn ss-btn--subtle"
              type="button"
              onClick={() => {
                setRequesterName("");
                setItemName("");
                setQuantity(1);
                setNotes("");
                setNotifyEmail("");
                setNotifyPhone("");
                setMsg(null);
                setErr(null);
              }}
            >
              Limpar
            </button>
          </div>

          {msg && <div className="ss-card ss-card--success">{msg}</div>}
          {err && <div className="ss-card ss-card--danger">{err}</div>}
          <small className="ss-dim">
            Seu pedido inicia com status <strong>pendente</strong>.
          </small>
        </form>
      </div>
    </>
  );
}
