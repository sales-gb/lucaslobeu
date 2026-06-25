// Tipos do conteúdo editorial da página Sobre (vêm do CMS via /api/about).

/** Empresa/marca com imagem do trabalho e link de saída para o Instagram. */
export interface Company {
  name: string;
  /** Ano do projeto feito para essa marca (exibido na extrema direita da linha). */
  year?: string;
  imageUrl?: string;
  instagramUrl?: string;
}

/** Marco da trajetória: ano + título + descrição opcional. */
export interface TrajectoryItem {
  year: string;
  title: string;
  description?: string;
}
