import os
from whoosh.index import create_in, open_dir, exists_in
from whoosh.fields import Schema, TEXT, ID, NUMERIC
from whoosh.qparser import QueryParser, OrGroup
from whoosh import scoring

# 1. Ορίζουμε το Schema (Τι πληροφορίες θα κρατάει ο Index)
# TEXT(stored=True): Αναζητήσιμο κείμενο που αποθηκεύεται
# ID(stored=True, unique=True): Μοναδικό κλειδί (το ID της βάσης)
schema = Schema(
    id=ID(stored=True, unique=True),
    type=TEXT(stored=True), # π.χ. 'meal' ή 'exercise'
    name=TEXT(stored=True),
    content=TEXT(stored=True) # macros ή λεπτομέρειες
)

from django.conf import settings
INDEX_DIR = os.path.join(settings.BASE_DIR, "whoosh_index")

def get_index():
    if not os.path.exists(INDEX_DIR):
        os.mkdir(INDEX_DIR)
        return create_in(INDEX_DIR, schema)
    return open_dir(INDEX_DIR)

# 2. Συνάρτηση για να προσθέτουμε/ενημερώνουμε δεδομένα στον Index
def update_index(item_id, item_type, name, content):
    ix = get_index()
    writer = ix.writer()
    writer.update_document(
        id=str(item_id),
        type=item_type,
        name=name,
        content=content
    )
    writer.commit()

# 3. Η Μηχανή Αναζήτησης (Search Logic)
def perform_search(user_query):
    ix = get_index()
    # Χρησιμοποιούμε BM25 scoring (η εξέλιξη του TF-IDF που ζήτησες)
    with ix.searcher(weighting=scoring.BM25F()) as searcher:
        # Ψάχνουμε στα πεδία 'name' και 'content'
        parser = QueryParser("name", ix.schema, group=OrGroup)
        query = parser.parse(user_query)
        
        results = searcher.search(query, limit=10)
        
        # Επιστρέφουμε τα αποτελέσματα μαζί με το Score (Relevance)
        return [
            {
                "id": r['id'],
                "type": r['type'],
                "name": r['name'],
                "score": round(r.score, 3) # Το IR Score!
            } for r in results
        ]
