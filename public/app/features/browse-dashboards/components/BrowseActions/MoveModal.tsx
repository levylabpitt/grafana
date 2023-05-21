import React, { useState } from 'react';

import { Alert, Button, Field, Modal } from '@grafana/ui';
import { FolderPicker } from 'app/core/components/Select/FolderPicker';

import { DashboardTreeSelection } from '../../types';

import { DescendantCount } from './DescendantCount';

export interface Props {
  isOpen: boolean;
  onConfirm: (targetFolderUid: string) => void;
  onDismiss: () => void;
  selectedItems: DashboardTreeSelection;
}

export const MoveModal = ({ onConfirm, onDismiss, selectedItems, ...props }: Props) => {
  const [moveTarget, setMoveTarget] = useState<string>();
  const selectedFolders = Object.keys(selectedItems.folder).filter((uid) => selectedItems.folder[uid]);

  const onMove = () => {
    if (moveTarget !== undefined) {
      onConfirm(moveTarget);
    }
    onDismiss();
  };

  return (
    <Modal title="Move" onDismiss={onDismiss} {...props}>
      {selectedFolders.length > 0 && <Alert severity="warning" title="Moving this item may change its permissions." />}
      This action will move the following content:
      <DescendantCount selectedItems={selectedItems} />
      <Field label="Folder name">
        <FolderPicker allowEmpty onChange={({ uid }) => setMoveTarget(uid)} />
      </Field>
      <Modal.ButtonRow>
        <Button onClick={onDismiss} variant="secondary" fill="outline">
          Cancel
        </Button>
        <Button disabled={moveTarget === undefined} onClick={onMove} variant="primary">
          Move
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
};
