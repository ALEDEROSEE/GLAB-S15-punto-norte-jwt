import { Brand } from './Login.jsx';

const currency = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const date = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeZone: 'UTC' });

export function Store({ account, onSignOut }) {
  const { usuario, pedidos } = account;
  const summary = [
    { label: 'Pedidos en total', count: pedidos.length },
    { label: 'En preparación', count: pedidos.filter(({ estado }) => estado === 'En preparación').length },
    { label: 'Entregados', count: pedidos.filter(({ estado }) => estado === 'Entregado').length },
  ];

  return (
    <>
      <header className="store-header">
        <div className="store-header-inner">
          <Brand />
          <div className="account-actions">
            <span className="account-user">
              <span className="avatar" aria-hidden="true">{usuario.at(0).toUpperCase()}</span>
              <span>{usuario}</span>
            </span>
            <button className="secondary-button" type="button" onClick={onSignOut}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="store-page">
        <div className="store-title">
          <p className="eyebrow">Mi cuenta</p>
          <h1>Mis pedidos</h1>
          <p>Revisa el avance y el importe de tus compras.</p>
        </div>

        <dl className="order-summary" aria-label="Resumen de pedidos">
          {summary.map(({ label, count }) => (
            <div className="summary-item" key={label}>
              <dt>{label}</dt>
              <dd>{count}</dd>
            </div>
          ))}
        </dl>

        <section className="orders" aria-labelledby="orders-title">
          <h2 id="orders-title">Historial de compras</h2>
          {pedidos.length ? (
            <div className="orders-scroll" role="region" aria-label="Tabla de pedidos" tabIndex={0}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Pedido</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr key={pedido.codigo}>
                      <th scope="row">{pedido.codigo}</th>
                      <td>
                        <time dateTime={pedido.fecha}>
                          {date.format(new Date(`${pedido.fecha}T00:00:00Z`))}
                        </time>
                      </td>
                      <td>
                        <span className={pedido.estado === 'Entregado' ? 'order-status delivered' : 'order-status'}>
                          {pedido.estado}
                        </span>
                      </td>
                      <td>{currency.format(pedido.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="orders-empty">Aún no tienes pedidos en tu cuenta.</p>
          )}
        </section>
      </main>
    </>
  );
}
