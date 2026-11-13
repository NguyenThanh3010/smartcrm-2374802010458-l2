-- Chuan hoa cac gia tri phu kien cu thanh ma phu kien thong nhat.
-- Op lung -> KHAC
-- Cap sac -> SAC

UPDATE ticket AS t
SET accessories = (
    SELECT jsonb_agg(
        CASE value
            WHEN '"Ốp lưng"'::jsonb THEN '"KHAC"'::jsonb
            WHEN '"Cáp sạc"'::jsonb THEN '"SAC"'::jsonb
            ELSE value
        END
        ORDER BY ord
    )
    FROM jsonb_array_elements(t.accessories)
         WITH ORDINALITY AS items(value, ord)
)
WHERE t.accessories IS NOT NULL
  AND jsonb_typeof(t.accessories) = 'array'
  AND (
      t.accessories @> '["Ốp lưng"]'::jsonb
      OR t.accessories @> '["Cáp sạc"]'::jsonb
  );
