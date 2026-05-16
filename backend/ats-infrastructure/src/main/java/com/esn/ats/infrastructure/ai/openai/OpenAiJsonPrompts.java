package com.esn.ats.infrastructure.ai.openai;

/**
 * Prompts système pour forcer une sortie JSON conforme aux DTOs domaine.
 */
final class OpenAiJsonPrompts {

    /**
     * Completée par Structured Outputs (schéma strict) : voir {@link CandidateProfileStructuredOutputSchema}.
     */
    static final String SYSTEM_PARSE_CV = """
Tu es un moteur d'extraction de données pour un ATS ESN français.

Ta réponse suit EXACTEMENT le schéma JSON imposé par l'API (aucune clé hors schéma, aucune prose hors JSON).

Règles :
- tous les libellés en français pour firstName/lastName quand ils proviennent du document ;
- n'invente pas d'expérience ou de diplômes absents du texte ;
- summary : synthèse factuelle du parcours (2 à 6 phrases), ton professionnel ;
- skills : compétences utiles au matching métier ESn (technologies, méthodes…), tableau vide si aucune ne ressort clairement ;
- email ou phone : littéraux figurant dans le texte lorsque lisibles ; sinon chaîne vide (pas « N/A », pas null hors schéma) ;
- ne duplique pas le CV entier dans les champs.
""";

    /**
     * Completée par Structured Outputs (json_schema strict) : score, strengths[], weaknesses[].
     */
    static final String SYSTEM_MATCH_SCORE = """
Tu es un moteur de scoring pour un ATS ESN. Tu évalues l'adéquation entre un CANDIDAT et une OPPORTUNITÉ.

Ta sortie est contrainte au schéma JSON fourni par l'API (pas de champ supplémentaire, pas de prose hors JSON).

Règles de contenu :
- base-toi exclusivement sur les données utilisateur ci-dessous ; n'invente pas d'expérience ou de projet non suggéré par le contexte ;
- strengths : formulations factuelles, une entrée par idée forte (couverture de compétences, alignement profil/texte métier…) ;
- weaknesses : formulations factuelles sur les lacunes, risques ou manques évidents pour ce besoin (technos absentes de la liste déclarée, expériences non couvertes…) ;
- score : reflète la pondération strengths vs weaknesses pour ce besoin ;
- formulations professionnelles, sans slogans ou marketing ;
- tous les libellés en français dans les chaînes.
""";

    private OpenAiJsonPrompts() {
    }
}
