
import { buscarContratosParaSincronizar, atualizarUltimaSincronizacao } from './oracle-service';
import { sincronizarParceiros } from './sync-parceiros-service';
import { sincronizarProdutos } from './sync-produtos-service';
import { sincronizarEstoques } from './sync-estoques-service';
import { sincronizarTabelaPrecos } from './sync-tabela-precos-service';
import { sincronizarExcecaoPreco } from './sync-excecao-preco-service';
import { sincronizarTiposNegociacao } from './sync-tipos-negociacao-service';
import { sincronizarTiposOperacao } from './sync-tipos-operacao-service';
import { sincronizarVendedores } from './sync-vendedores-service';
import { sincronizarCabecalhoNota } from './sync-cabecalho-nota-service';
import { sincronizarFinanceiro } from './sync-financeiro-service';

interface SyncQueueItem {
  idEmpresa: number;
  empresa: string;
  timestamp: Date;
}

class SyncQueueService {
  private queue: SyncQueueItem[] = [];
  private isProcessing: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    if (this.intervalId) {
      console.log('⚠️ Fila de sincronização já está rodando');
      return;
    }

    console.log('🚀 Iniciando serviço de fila de sincronização');
    
    // Verificar a cada minuto se há sincronizações pendentes
    this.intervalId = setInterval(async () => {
      await this.checkAndQueueSyncs();
    }, 60000); // 1 minuto

    // Executar primeira verificação imediatamente
    this.checkAndQueueSyncs();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Serviço de fila de sincronização parado');
    }
  }

  private async checkAndQueueSyncs() {
    try {
      const contratos = await buscarContratosParaSincronizar();
      
      if (contratos.length === 0) {
        return;
      }

      console.log(`📋 ${contratos.length} contrato(s) encontrado(s) para sincronização`);

      for (const contrato of contratos) {
        // Verificar se já não está na fila
        const jaExiste = this.queue.some(item => item.idEmpresa === contrato.ID_EMPRESA);
        
        if (!jaExiste) {
          this.queue.push({
            idEmpresa: contrato.ID_EMPRESA,
            empresa: contrato.EMPRESA,
            timestamp: new Date()
          });
          
          console.log(`➕ Adicionado à fila: ${contrato.EMPRESA} (ID: ${contrato.ID_EMPRESA})`);
        }
      }

      // Processar fila se não estiver processando
      if (!this.isProcessing && this.queue.length > 0) {
        this.processQueue();
      }
    } catch (error) {
      console.error('❌ Erro ao verificar sincronizações pendentes:', error);
    }
  }

  private async processQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      
      if (!item) break;

      console.log(`🔄 Processando sincronização: ${item.empresa} (${this.queue.length} restantes na fila)`);

      try {
        await this.syncAllTables(item.idEmpresa, item.empresa);
        await atualizarUltimaSincronizacao(item.idEmpresa);
        console.log(`✅ Sincronização concluída: ${item.empresa}`);
      } catch (error) {
        console.error(`❌ Erro na sincronização de ${item.empresa}:`, error);
      }
    }

    this.isProcessing = false;
    console.log('✨ Fila de sincronização processada completamente');
  }

  private async syncAllTables(idEmpresa: number, empresa: string) {
    const tabelas = [
      { nome: 'Parceiros', fn: sincronizarParceiros },
      { nome: 'Vendedores', fn: sincronizarVendedores },
      { nome: 'Tipos de Negociação', fn: sincronizarTiposNegociacao },
      { nome: 'Tipos de Operação', fn: sincronizarTiposOperacao },
      { nome: 'Produtos', fn: sincronizarProdutos },
      { nome: 'Estoques', fn: sincronizarEstoques },
      { nome: 'Tabela de Preços', fn: sincronizarTabelaPrecos },
      { nome: 'Exceção de Preço', fn: sincronizarExcecaoPreco },
      { nome: 'Cabeçalho de Nota', fn: sincronizarCabecalhoNota },
      { nome: 'Financeiro', fn: sincronizarFinanceiro }
    ];

    for (const tabela of tabelas) {
      try {
        console.log(`  ⏳ Sincronizando ${tabela.nome}...`);
        await tabela.fn(idEmpresa);
        console.log(`  ✓ ${tabela.nome} sincronizado`);
      } catch (error) {
        console.error(`  ✗ Erro ao sincronizar ${tabela.nome}:`, error);
        // Continuar com as próximas tabelas mesmo se uma falhar
      }
    }
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      queue: this.queue
    };
  }
}

export const syncQueueService = new SyncQueueService();
