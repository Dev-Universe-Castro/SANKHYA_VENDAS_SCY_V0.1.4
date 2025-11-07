
-- Script para adicionar campo IS_SANDBOX na tabela AD_CONTRATOS
-- Execute este script no banco de dados Oracle FREEPDB1

-- Adicionar coluna IS_SANDBOX
ALTER TABLE AD_CONTRATOS 
ADD IS_SANDBOX CHAR(1) DEFAULT 'S' CHECK (IS_SANDBOX IN ('S', 'N'));

-- Comentário na coluna
COMMENT ON COLUMN AD_CONTRATOS.IS_SANDBOX IS 'Indica se usa ambiente sandbox (S) ou produção (N)';

-- Atualizar registros existentes para usar sandbox por padrão
UPDATE AD_CONTRATOS SET IS_SANDBOX = 'S' WHERE IS_SANDBOX IS NULL;

COMMIT;
