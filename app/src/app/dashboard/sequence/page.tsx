import { requireCtx } from '@/lib/auth';
import { stepsOf } from '@/lib/engine';
import { LIBRARY } from '@/lib/library';
import { SequenceEditor } from '@/components/SequenceEditor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Séquence' };

export default async function SequencePage() {
  const { account } = await requireCtx();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Votre séquence</h1>
          <p>Les messages envoyés à chaque nouveau contact : une réponse immédiate puis des relances. Choisissez un modèle ou écrivez à votre voix.</p>
        </div>
      </div>
      <SequenceEditor
        initial={stepsOf(account)}
        library={LIBRARY}
        vars={{ mon_prenom: account.my_name, activite: account.activity, lien: account.booking_link }}
      />
    </>
  );
}
