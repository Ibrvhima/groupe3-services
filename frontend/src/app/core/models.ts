/** Modèles TypeScript miroirs des modèles Django. */

export interface User {
  id:        number;
  email:     string;
  nom:       string;
  prenom:    string;
  telephone: string;
  role:      'client' | 'prestataire' | 'admin';
  photo?:    string | null;
}

export interface AuthResponse {
  access:   string;
  refresh:  string;
  user:     User;
}

export interface Categorie {
  id:          number;
  nom:         string;
  icone:       string;
  description: string;
}

export interface Prestataire {
  id:            number;
  user:          User;
  categorie:     Categorie | null;
  description:   string;
  quartier:      string;
  telephone:     string;
  photo:         string | null;   // URL absolue retournée par DRF
  disponible:    boolean;
  approuve:      boolean;
  note_moyenne:  string;          // DecimalField retourné en string par DRF
  badge_verifie: boolean;
  created_at:    string;
}

export interface Notification {
  id:         number;
  titre:      string;
  message:    string;
  lu:         boolean;
  created_at: string;
}

export type StatutDemande =
  | 'en_attente'
  | 'acceptee'
  | 'refusee'
  | 'en_cours'
  | 'terminee'
  | 'annulee';

export interface Demande {
  id:               number;
  client:           number;
  client_info:      User;
  prestataire:      number;
  prestataire_info: Prestataire;
  description:      string;
  adresse:          string;
  date_souhaitee:   string | null;
  statut:           StatutDemande;
  statut_display:   string;
  date_creation:    string;
  date_maj:         string;
}

export interface DemandeCreate {
  prestataire:    number;
  description:    string;
  adresse:        string;
  date_souhaitee?: string;
}

/** Réponse paginée standard de DRF. */
export interface PaginatedResponse<T> {
  count:    number;
  next:     string | null;
  previous: string | null;
  results:  T[];
}
