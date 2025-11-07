-- Atualizar senha do contrato 1 (DEV) para texto plano
UPDATE AD_CONTRATOS 
SET SANKHYA_PASSWORD = 'SuaSenhaAqui' 
WHERE ID_EMPRESA = 1;

COMMIT;
