-- Moasist: nombre corto de empresa para el saludo de bienvenida.
--
-- El saludo de RR.HH. usa `company.shortName` ("Hola, INMOA"). Los datasets
-- creados antes de este campo no lo tienen, así que se rellena una sola vez
-- para las empresas conocidas, sin pisar un valor ya editado por el usuario.

update hr_dataset
set data = jsonb_set(
  data,
  '{companies}',
  (
    select jsonb_agg(
      case
        when c ? 'shortName' then c
        when c->>'id' = 'inmoa' then c || '{"shortName":"INMOA"}'::jsonb
        when c->>'id' = '7pollitos' then c || '{"shortName":"Los 7 Pollitos"}'::jsonb
        when c->>'id' = 'plumifero' then c || '{"shortName":"Plumífero"}'::jsonb
        else c
      end
      order by ord
    )
    from jsonb_array_elements(data->'companies') with ordinality as t(c, ord)
  )
)
where jsonb_typeof(data->'companies') = 'array';
