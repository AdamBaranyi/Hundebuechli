import { router } from 'expo-router';
import { View } from 'react-native';

import { documentCategories, documentsText } from '@/content/documents';
import { formatLocal } from '@/content/format';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Row } from '@/ui/Row';
import { Screen } from '@/ui/Screen';
import { SectionTitle } from '@/ui/SectionTitle';
import { Sheet } from '@/ui/Sheet';
import { EmptyState, ErrorState, LoadingState } from '@/ui/StateViews';
import { space } from '@/ui/tokens';

import { useDog } from '../dogs/queries';
import { type DocumentView, useDocuments } from './queries';

/** Die Dokumente eines Hundes nach Art; alles liegt auf dem Gerät. */
export function DocumentsScreen({ dogId }: { dogId: string | null }) {
  const dog = useDog(dogId);
  const documents = useDocuments(dogId ?? '');
  const list = documents.data ?? [];
  const groups = new Map<string, DocumentView[]>();
  for (const document of list) {
    groups.set(document.category, [...(groups.get(document.category) ?? []), document]);
  }

  return (
    <Screen withHeader inTabs>
      <View style={{ gap: space.s1 }}>
        <AppText variant="largeTitle" heading={1}>
          {documentsText.title}
        </AppText>
        {dog.data ? <AppText color="pencil">{dog.data.name}</AppText> : null}
      </View>
      {documents.isPending ? <LoadingState /> : null}
      {documents.isError ? <ErrorState onRetry={() => void documents.refetch()} /> : null}
      {documents.isSuccess && list.length === 0 ? (
        <EmptyState title={documentsText.empty} text={documentsText.emptyText} />
      ) : null}
      {[...groups.entries()].map(([category, items]) => (
        <View key={category} style={{ gap: space.s3 }}>
          <SectionTitle>{documentCategories[category as DocumentView['category']]}</SectionTitle>
          <Sheet>
            {items.map((document) => (
              <Row
                key={document.id}
                icon="document"
                title={document.title}
                secondary={document.date ? formatLocal.long(document.date) : undefined}
                status={{
                  text:
                    document.pages.length > 0
                      ? documentsText.pages(document.pages.length)
                      : documentsText.noPages,
                }}
                onPress={() =>
                  router.push({ pathname: '/edit-document/[id]', params: { id: document.id } })
                }
              />
            ))}
          </Sheet>
        </View>
      ))}
      {dogId ? (
        <Button
          label={documentsText.add}
          icon="plus"
          onPress={() => router.push({ pathname: '/new-document', params: { dogId } })}
        />
      ) : null}
    </Screen>
  );
}
