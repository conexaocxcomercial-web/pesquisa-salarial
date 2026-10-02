/* ------------------------------------------------------------------
   DADOS DA PESQUISA: PESQUISA_SALARIAL_-_INCAAS.xlsx, ano-base 2026.
   Para atualizar o painel, edite apenas este arquivo.
   Uma linha por referência (P = principal, A = alternativa), na ordem:
   código, nome curto, nome do pilar, fonte, nível do pilar (Pl/Sr), cargo,
   CBO, abrangência (Natal/Brasil), salário mínimo, médio, teto,
   júnior, pleno, sênior, micro, pequena, média, grande (null = sem dado).
------------------------------------------------------------------- */
export const BRUTO = [
  ["P11", "Conteúdo digital", "Criação de conteúdo digital", "P", "Sr", "Adm. de Sites (Web Master)", "2624-10", "Natal", 1946.17, 2034.17, 3690.72, 1388, 1815, 2351, 2151.43, 2463.92, 2646.48, null],
  ["P11", "Conteúdo digital", "Criação de conteúdo digital", "A", "Sr", "Adm. de Sites (Web Master)", "2534-05", "Natal", 1836.76, 2037.1, 3633.86, 1280, 1664, 2158, 2148.56, 2461.09, 2075.2, null],
  ["P12", "Mídias e conteúdo", "Adm. de mídias e conteúdo", "P", "Sr", "Adm. de Sites (Web Master)", "2534-05", "Natal", 1836.76, 2037.1, 3633.86, 1280, 1664, 2158, 2148.56, 2461.09, 2075.2, null],
  ["P12", "Mídias e conteúdo", "Adm. de mídias e conteúdo", "A", "Sr", "Adm. de Sites (Web Master)", "2624-10", "Natal", 1946.17, 2034.17, 3690.72, 1388, 1815, 2351, 2151.43, 2463.92, 2646.48, null],
  ["P13", "Sustentação de portais", "Sustentação de portais", "P", "Pl", "Adm. de Sites (Web Master)", "2124-05", "Natal", 1775.79, 5024.36, 9646.46, 4243, 5654, 7325, 4526.56, 4975.19, 7320.09, 5793.36],
  ["P13", "Sustentação de portais", "Sustentação de portais", "A", "Pl", "Adm. de Sites (Web Master)", "2124-20", "Natal", 1621.0, 2720.58, 3935.63, 2312, 3121, 4026, 3241.0, 2577.26, 3908.52, 7155.75],
  ["P14", "Evolução de portais", "Evolução de portais", "P", "Sr", "Analista de Sistemas Sr", "2124-05", "Natal", 1775.79, 5024.36, 9646.46, 4243, 5654, 7325, 4526.56, 4975.19, 7320.09, 5793.36],
  ["P14", "Evolução de portais", "Evolução de portais", "A", "Sr", "Analista de Sistemas Sr", "3171-05", "Brasil", 2520.4, 4120.5, 7850.0, 3200, 4500, 6200, 3800.0, 4200.0, 4900.0, 6500.0],
  ["P15/P217", "Coordenação", "Coordenação", "P", "Sr", "Gerente/Coord. Projeto TI", "1425-20", "Brasil", 4512.3, 8920.45, 18500.0, 6500, 9200, 13400, 7100.0, 8400.0, 10500.0, 14200.0],
  ["P15/P217", "Coordenação", "Coordenação", "A", "Sr", "Gerente/Coord. Projeto TI", "1425-20", "Brasil", 4512.3, 8920.45, 18500.0, 6500, 9200, 13400, 7100.0, 8400.0, 10500.0, 14200.0],
  ["P26/P28", "Sustentação de aplicações", "Sustentação de aplicações", "P", "Pl", "Analista de Sistemas Pl", "2124-05", "Natal", 1775.79, 5024.36, 9646.46, 4243, 5654, 7325, 4526.56, 4975.19, 7320.09, 5793.36],
  ["P26/P28", "Sustentação de aplicações", "Sustentação de aplicações", "A", "Pl", "Analista de Sistemas Pl", "3171-10", "Natal", 4525.64, 3311.58, 5860.05, 3311, 4442, 5732, 3660.68, 3531.67, 3717.87, 6857.55],
  ["P27/P29", "Desenvolvimento de aplicações", "Desenvolvimento de aplicações", "P", "Sr", "Analista de Sistemas Sr", "2124-05", "Natal", 1775.79, 5024.36, 9646.46, 4243, 5654, 7325, 4526.56, 4975.19, 7320.09, 5793.36],
  ["P27/P29", "Desenvolvimento de aplicações", "Desenvolvimento de aplicações", "A", "Sr", "Analista de Sistemas Sr", "3171-10", "Natal", 4525.64, 3311.58, 5860.05, 3311, 4442, 5732, 3660.68, 3531.67, 3717.87, 6857.55],
  ["P210", "Arquitetura", "Arquitetura", "P", "Sr", "Arquiteto de Software", "2124-25", "Brasil", 6200.0, 12450.0, 24000.0, 9500, 13200, 18500, 10200.0, 11800.0, 14600.0, 19800.0],
  ["P210", "Arquitetura", "Arquitetura", "A", "Sr", "Arquiteto de Software", "2122-05", "Brasil", 5500.0, 11200.0, 22000.0, 8800, 12100, 16900, 9400.0, 10800.0, 13200.0, 18100.0],
  ["P211", "Testes e QA", "Testes e QA", "P", "Pl", "Analista de Sistemas Pl", "2124-30", "Brasil", 3200.0, 6250.0, 12800.0, 4800, 6700, 9400, 5300.0, 6100.0, 7500.0, 10200.0],
  ["P211", "Testes e QA", "Testes e QA", "A", "Pl", "Analista de Sistemas Pl", "2124-05", "Natal", 1775.79, 5024.36, 9646.46, 4243, 5654, 7325, 4526.56, 4975.19, 7320.09, 5793.36],
  ["P212", "BI e IA", "BI e IA", "P", "Pl", "Analista de Sistemas Pl", "2124-05", "Natal", 1775.79, 5024.36, 9646.46, 4243, 5654, 7325, 4526.56, 4975.19, 7320.09, 5793.36],
  ["P212", "BI e IA", "BI e IA", "A", "Pl", "Analista de Sistemas Pl", "2122-05", "Brasil", 5500.0, 11200.0, 22000.0, 8800, 12100, 16900, 9400.0, 10800.0, 13200.0, 18100.0],
  ["P213", "Requisitos", "Requisitos", "P", "Sr", "Analista de Sistemas Sr", "2124-05", "Natal", 1775.79, 5024.36, 9646.46, 4243, 5654, 7325, 4526.56, 4975.19, 7320.09, 5793.36],
  ["P213", "Requisitos", "Requisitos", "A", "Sr", "Analista de Sistemas Sr", "2124-05", "Natal", 1775.79, 5024.36, 9646.46, 4243, 5654, 7325, 4526.56, 4975.19, 7320.09, 5793.36],
  ["P214", "UX/UI", "UX/UI", "P", "Pl", "Analista de Sistemas Pl", "2624-10", "Natal", 1946.17, 2034.17, 3690.72, 1388, 1815, 2351, 2151.43, 2463.92, 2646.48, null],
  ["P214", "UX/UI", "UX/UI", "A", "Pl", "Analista de Sistemas Pl", "2124-05", "Natal", 1775.79, 5024.36, 9646.46, 4243, 5654, 7325, 4526.56, 4975.19, 7320.09, 5793.36],
  ["P215", "Conteúdo Setic", "Conteúdo Setic", "P", "Pl", "Adm. de Sites (Web Master)", "2624-10", "Natal", 1946.17, 2034.17, 3690.72, 1388, 1815, 2351, 2151.43, 2463.92, 2646.48, null],
  ["P215", "Conteúdo Setic", "Conteúdo Setic", "A", "Pl", "Adm. de Sites (Web Master)", "2534-05", "Natal", 1836.76, 2037.1, 3633.86, 1280, 1664, 2158, 2148.56, 2461.09, 2075.2, null],
  ["P216", "CI/CD (DevOps)", "CI/CD (DevOps)", "P", "Sr", "Analista de Suporte Sr", "2124-20", "Natal", 1621.0, 2720.58, 3935.63, 2312, 3121, 4026, 3241.0, 2577.26, 3908.52, 7155.75],
  ["P216", "CI/CD (DevOps)", "CI/CD (DevOps)", "A", "Sr", "Analista de Suporte Sr", "2123-15", "Brasil", 3500.0, 6800.0, 13500.0, 5200, 7300, 10100, 5800.0, 6600.0, 8100.0, 11000.0],
];
