// Cliente/marca global — fonte única consumida pela Home, pela página Sobre e
// atrelada aos Projetos. Forma leve, voltada à exibição (sem timestamps).
export interface Client {
  id: string;
  name: string;
  /** Ano de referência do trabalho (exibido à direita do nome). */
  year: string;
  /** Categoria/setor (ex: Moda, Bebidas) — exibido junto ao ano. */
  category: string;
  /** Imagem do trabalho (URL resolvida) — revelada no hover. */
  imageUrl: string;
  /** Link de saída para o post/perfil no Instagram. */
  instagramUrl: string;
}
