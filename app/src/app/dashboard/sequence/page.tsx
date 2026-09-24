import { requireCtx } from '@/lib/auth';
import { stepsOf } from '@/lib/engine';
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
          <p>Trois messages par défaut : réponse immédiate, relance douce à J+2, dernière relance à J+5. Modifiez-les à votre voix.</p>
        </div>
      </div>
      <SequenceEditor initial={stepsOf(account)} vars={{ mon_prenom: account.my_name, activite: account.activity, lien: account.booking_link }} />
    </>
  );
}
