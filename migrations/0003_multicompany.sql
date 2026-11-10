-- Moasist multiempresa: cada credencial queda ligada a una empresa.
--
-- El dataset guarda todas las empresas en un mismo documento JSONB
-- (`hr_dataset`), pero cada sesión se filtra por `company_id`: el RR.HH. de una
-- empresa solo ve la suya. El superadmin (desarrollador) no tiene empresa fija
-- (company_id NULL) y puede cambiar entre todas desde la barra superior.
--
-- Se agrega la columna de forma idempotente para que un despliegue sobre la
-- base existente no falle.

alter table hr_credential add column if not exists company_id text;

create index if not exists hr_credential_company_id_idx on hr_credential (company_id);

-- Empresa activa de la sesión. El superadmin la cambia desde la barra superior;
-- los demás roles quedan fijos a la empresa de su credencial.
alter table hr_session add column if not exists active_company_id text;
