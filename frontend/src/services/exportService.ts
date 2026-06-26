import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Cliente } from './clienteService';

export const exportService = {
  // ============================================
  // EXPORTAR PARA EXCEL
  // ============================================
  toExcel(clientes: Cliente[], nomeArquivo: string = 'clientes') {
    const dados = clientes.map(cliente => ({
      Nome: cliente.nome,
      Email: cliente.email,
      Telefone: cliente.telefone,
      Rua: cliente.endereco.rua || '',
      Número: cliente.endereco.numero || '',
      Bairro: cliente.endereco.bairro || '',
      Cidade: cliente.endereco.cidade || '',
      Estado: cliente.endereco.estado || '',
      CEP: cliente.endereco.cep || '',
      'Data Cadastro': cliente.createdAt ? new Date(cliente.createdAt).toLocaleDateString('pt-BR') : '',
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

    // Ajustar largura das colunas
    const colunas = [
      { wch: 25 }, // Nome
      { wch: 30 }, // Email
      { wch: 18 }, // Telefone
      { wch: 30 }, // Rua
      { wch: 10 }, // Número
      { wch: 20 }, // Bairro
      { wch: 20 }, // Cidade
      { wch: 10 }, // Estado
      { wch: 15 }, // CEP
      { wch: 15 }, // Data Cadastro
    ];
    ws['!cols'] = colunas;

    XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
  },

  // ============================================
  // EXPORTAR PARA PDF
  // ============================================
  // Exportar para PDF
// Exportar para PDF
// Exportar para PDF (versão texto puro)
toPDF(clientes: Cliente[], titulo: string = 'Relatório de Clientes') {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // ===== CABEÇALHO =====
  doc.setFontSize(22);
  doc.setTextColor('#1a237e');
  doc.text('ARCAR HB', 14, 25);

  doc.setFontSize(12);
  doc.setTextColor('#1a237e');
  doc.text(titulo, 14, 35);

  doc.setFontSize(9);
  doc.setTextColor('#666666');
  doc.text(`Gerado em: ${dataAtual}`, 14, 43);
  doc.text(`Total de clientes: ${clientes.length}`, 14, 50);

  // ===== DADOS EM TEXTO =====
  let y = 60;
  const lineHeight = 7;

  // Cabeçalho da tabela em texto
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#1a237e');
  
  const col1 = 14;
  const col2 = 55;
  const col3 = 100;
  const col4 = 130;
  const col5 = 165;
  const col6 = 195;

  doc.text('Nome', col1, y);
  doc.text('Email', col2, y);
  doc.text('Telefone', col3, y);
  doc.text('Cidade', col4, y);
  doc.text('UF', col5, y);
  doc.text('Data', col6, y);
  
  y += 4;
  
  // Linha separadora
  doc.setDrawColor('#1a237e');
  doc.setLineWidth(0.5);
  doc.line(14, y, 280, y);
  y += 5;

  // Dados
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#333333');
  doc.setFontSize(8);

  let pageCount = 1;

  clientes.forEach((cliente, index) => {
    if (y > 175) {
      doc.addPage();
      pageCount++;
      y = 20;
      
      // Repetir cabeçalho na nova página
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor('#1a237e');
      doc.text('Nome', col1, y);
      doc.text('Email', col2, y);
      doc.text('Telefone', col3, y);
      doc.text('Cidade', col4, y);
      doc.text('UF', col5, y);
      doc.text('Data', col6, y);
      y += 4;
      doc.line(14, y, 280, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#333333');
      doc.setFontSize(8);
    }

    const nome = (cliente.nome || '-').substring(0, 20);
    const email = (cliente.email || '-').substring(0, 25);
    const telefone = cliente.telefone || '-';
    const cidade = (cliente.endereco?.cidade || '-').substring(0, 18);
    const estado = cliente.endereco?.estado || '-';
    const data = cliente.createdAt ? new Date(cliente.createdAt).toLocaleDateString('pt-BR') : '-';

    doc.text(nome, col1, y);
    doc.text(email, col2, y);
    doc.text(telefone, col3, y);
    doc.text(cidade, col4, y);
    doc.text(estado, col5, y);
    doc.text(data, col6, y);
    
    y += lineHeight;
  });

  // ===== RODAPÉ =====
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor('#cccccc');
    doc.setLineWidth(0.3);
    doc.line(14, doc.internal.pageSize.height - 12, 280, doc.internal.pageSize.height - 12);
    
    doc.setFontSize(8);
    doc.setTextColor('#999999');
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 6
    );
    doc.text(
      'ARCAR HB - Sistema de Gestao',
      14,
      doc.internal.pageSize.height - 6
    );
  }

  doc.save('clientes.pdf');
},

  // ============================================
  // EXPORTAR PARA CSV
  // ============================================
  toCSV(clientes: Cliente[], nomeArquivo: string = 'clientes') {
    const cabecalho = 'Nome,Email,Telefone,Cidade,Estado,Data Cadastro\n';
    const linhas = clientes
      .map(cliente =>
        [
          cliente.nome || '',
          cliente.email || '',
          cliente.telefone || '',
          cliente.endereco?.cidade || '',
          cliente.endereco?.estado || '',
          cliente.createdAt ? new Date(cliente.createdAt).toLocaleDateString('pt-BR') : '',
        ].join(',')
      )
      .join('\n');

    const blob = new Blob([cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nomeArquivo}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  },
};