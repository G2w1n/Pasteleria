// src/components/panel/Usuarios.jsx · roles y cuentas (solo administrador)
import { useEffect, useState } from "react";

const ROLES = { cliente: "Cliente", empleado: "Empleado", administrador: "Administrador" };

export default function Usuarios({ api, yo }) {
  const [usuarios, setUsuarios] = useState(null);
  const [texto, setTexto] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    api("admin?recurso=usuarios").then((d) => setUsuarios(d.usuarios)).catch((e) => setMensaje(e.message));
  }, [api]);

  const guardar = async (u, cambios) => {
    try {
      const { usuario } = await api("admin?recurso=usuarios", { metodo: "POST", datos: { id: u.id, ...cambios } });
      setUsuarios((lista) => lista.map((x) => (x.id === usuario.id ? { ...x, ...usuario } : x)));
      setMensaje(`${u.nombre}: guardado.`);
    } catch (e) {
      setMensaje(e.message);
    }
  };

  if (!usuarios) return <p className="fg-3"><span className="spinner-border spinner-sm" aria-hidden="true" /> Cargando usuarios…</p>;
  const buscado = texto.trim().toLowerCase();
  const visibles = usuarios.filter((u) => !buscado || `${u.nombre} ${u.correo}`.toLowerCase().includes(buscado));

  return (
    <div>
      <div className="panel-barra">
        <label className="form-control form-adorn panel-buscar">
          <span className="form-adorn-icon"><i className="bi bi-search" aria-hidden="true" /></span>
          <span className="visually-hidden">Buscar usuario</span>
          <input className="form-ghost" type="search" placeholder="Buscar por nombre o correo" value={texto} onChange={(e) => setTexto(e.target.value)} />
        </label>
        <p className="fg-3 fs-sm mb-0">{visibles.length} usuarios</p>
      </div>
      <p className="fs-sm" role="status">{mensaje}</p>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead><tr><th scope="col">Nombre</th><th scope="col">Correo</th><th scope="col">Pedidos</th><th scope="col">Rol</th><th scope="col">Activo</th></tr></thead>
          <tbody>
            {visibles.map((u) => (
              <tr key={u.id} className={u.activo ? "" : "fila-inactiva"}>
                <th scope="row">{u.nombre}{u.id === yo && <span className="badge theme-accent ms-2">Tú</span>}</th>
                <td>{u.correo}</td>
                <td>{u.pedidos}</td>
                <td>
                  <label className="visually-hidden" htmlFor={`rol-${u.id}`}>Rol de {u.nombre}</label>
                  <select id={`rol-${u.id}`} className="form-control form-control-sm" value={u.rol} disabled={u.id === yo}
                          onChange={(e) => guardar(u, { rol: e.target.value })}>
                    {Object.entries(ROLES).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                  </select>
                </td>
                <td>
                  <div className="switch">
                    <input type="checkbox" role="switch" checked={u.activo} disabled={u.id === yo} aria-label={`Cuenta de ${u.nombre} activa`}
                           onChange={(e) => guardar(u, { activo: e.target.checked })} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
