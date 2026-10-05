function PorPorte({ linhas, C, sub }) {
  const PORTES = ["Micro", "Pequena", "Média", "Grande"];
  // Os quatro portes são comparados sempre nas mesmas referências:
  // só entram as que têm valor informado para todos os portes.
  const base = linhas.filter((r) => PORTES.every((p) => r.porte[p] != null));
  const fora = linhas.length - base.length;
  const dados = PORTES.map((p) => ({ porte: p, med: base.length ? media(base.map((r) => r.porte[p])) : null }));
  const geral = media(base.map((r) => r.med));
  return (
    <Painel titulo="Salário médio por porte de empresa" sub={sub}>
      {base.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-center text-sm px-6" style={{ color: v("ink-3") }}>
          As referências filtradas não têm salário informado para todos os portes de empresa.
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dados} margin={{ top: 22, right: 4, bottom: 0, left: 4 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke={C.rule} />
              <XAxis dataKey="porte" {...eixo(C)} />
              <YAxis hide domain={[0, "dataMax"]} />
              <Tooltip cursor={{ fill: C.canvas }} content={<Dica />} />
              <ReferenceLine y={geral} stroke={C.ink3} strokeDasharray="3 3"
                label={{ value: `média geral ${num(geral)}`, position: "insideTopRight", fill: C.ink2, fontSize: 10.5 }} />
              <Bar dataKey="med" name="Salário médio" fill={C.base} isAnimationActive={false} radius={[2, 2, 0, 0]}>
                <LabelList dataKey="med" {...rotuloTopo(C, 11.5)} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {fora > 0 && (
            <p className="mt-2 text-xs" style={{ color: v("ink-3") }}>
              {fora} {fora === 1 ? "referência sem salário informado para algum porte ficou" : "referências sem salário informado para algum porte ficaram"} fora desta comparação.
            </p>
          )}
        </>
      )}
    </Painel>
  );
}
