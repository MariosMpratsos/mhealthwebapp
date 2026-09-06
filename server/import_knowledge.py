import os
import django

# Ρυθμίσεις Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fitnessServer.settings')
django.setup()

from base.models import Article
from base.search_engine import update_index


def run_import():
    # Ο φάκελος με τα κείμενα -- σχετικό path ως προς το ίδιο το script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    folder_path = os.path.join(base_dir, 'knowledge_base')

    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        print(f"   Φτιάξε τον φάκελο '{folder_path}' και βάλε μέσα .txt αρχεία!")
        return

    txt_files = [f for f in os.listdir(folder_path) if f.endswith(".txt")]

    if not txt_files:
        print(f"   Ο φάκελος '{folder_path}' υπάρχει αλλά δεν βρέθηκαν .txt αρχεία μέσα!")
        return

    print(f"  Βρέθηκαν {len(txt_files)} αρχεία. Ξεκινάει η εισαγωγή στην Knowledge Base...")

    for filename in txt_files:
        file_path = os.path.join(folder_path, filename)

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            title = filename.replace(".txt", "").replace("_", " ").title()

            obj, created = Article.objects.get_or_create(
                title=title,
                defaults={'content': content, 'category': 'Scientific Article'}
            )

            # ΣΗΜΑΝΤΙΚΟ: καλούμε το update_index() ΡΗΤΑ εδώ, πάντα —
            # όχι μόνο μέσω του post_save signal.
            # Έτσι, ακόμα κι αν το άρθρο υπήρχε ήδη (created=False) και το
            # signal δεν πυροδοτήθηκε, το index ενημερώνεται σίγουρα.
            update_index(obj.id, 'article', obj.title, obj.content)

            if created:
                print(f"   Νέο άρθρο: {title}")
            else:
                print(f"  Ήδη υπάρχει (re-indexed): {title}")

    print("  ΤΕΛΟΣ! Η μηχανή αναζήτησης είναι πλούσια σε γνώση.")


if __name__ == "__main__":
    run_import()
