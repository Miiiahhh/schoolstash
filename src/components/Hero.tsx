export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-text">
          <h1 className="hero-title">Fazer um pedido</h1>
          <p className="hero-subtitle ss-dim">
            Preencha o formulário abaixo para solicitar itens do depósito escolar.
            Você pode acompanhar o status na lista pública.
          </p>
          {/* Botão removido a pedido */}
        </div>
      </div>
    </section>
  );
}
