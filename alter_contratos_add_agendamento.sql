
-- Adicionar campos de agendamento à tabela AD_CONTRATOS
ALTER TABLE AD_CONTRATOS ADD (
    SYNC_ATIVO CHAR(1) DEFAULT 'N' CHECK (SYNC_ATIVO IN ('S', 'N')),
    SYNC_INTERVALO_MINUTOS NUMBER(10) DEFAULT 120,
    ULTIMA_SINCRONIZACAO TIMESTAMP,
    PROXIMA_SINCRONIZACAO TIMESTAMP
);

-- Adicionar comentários
COMMENT ON COLUMN AD_CONTRATOS.SYNC_ATIVO IS 'Indica se a sincronização automática está ativa (S/N)';
COMMENT ON COLUMN AD_CONTRATOS.SYNC_INTERVALO_MINUTOS IS 'Intervalo em minutos entre sincronizações automáticas';
COMMENT ON COLUMN AD_CONTRATOS.ULTIMA_SINCRONIZACAO IS 'Data/hora da última sincronização realizada';
COMMENT ON COLUMN AD_CONTRATOS.PROXIMA_SINCRONIZACAO IS 'Data/hora agendada para a próxima sincronização';

-- Criar índice para consultas de agendamento
CREATE INDEX IDX_CONTRATOS_SYNC ON AD_CONTRATOS(SYNC_ATIVO, PROXIMA_SINCRONIZACAO);

COMMIT;
