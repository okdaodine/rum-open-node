import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import Modal from 'components/Modal';
import { TextField } from '@material-ui/core';
import Button from 'components/Button';
import { IGroup } from 'apis/types';
import { GroupApi } from 'apis';
import sleep from 'utils/sleep';
import { useStore } from 'store';

interface IProps {
  open: boolean
  onClose: () => void
  addGroup: (group: IGroup) => void
}

const Main = observer((props: IProps) => {
  const { snackbarStore } = useStore();
  const state = useLocalObservable(() => ({
    groupName: '',
    submitting: false,
    submitted: false,
  }));
 
  const submit = async () => {
    if (state.submitting) {
      return;
    }
    state.submitting = true;
    try {
      const group = await GroupApi.create(state.groupName);
      await sleep(400);
      state.submitted = true;
      await sleep(400);
      props.onClose();
      await sleep(400);
      props.addGroup(group);
      await sleep(400);
      snackbarStore.show({
        message: 'created',
      });
    } catch (err) {
      console.log(err);
      snackbarStore.show({
        message: 'something wrong',
        type: 'error',
      });
    }
    state.submitting = false;
  }

  return (
    <div className="bg-white dark:bg-[#181818] py-8 px-10 w-[320px] box-border">
      <div className="text-18 font-bold dark:text-white dark:text-opacity-80 text-gray-700 text-center">Create group</div>
      <div className="pt-6 relative">
        <TextField
          className="w-full"
          placeholder="group name"
          size="small"
          value={state.groupName}
          autoFocus
          onChange={(e) => { state.groupName = e.target.value.trim() }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
              submit();
            }
          }}
          margin="dense"
          variant="outlined"
        />
      </div>
      <div className="mt-8 flex justify-center">
        <Button
          fullWidth
          isDoing={state.submitting}
          isDone={state.submitted}
          disabled={!state.groupName}
          onClick={submit}
          color="orange"
        >
          Ok
        </Button>
      </div>
    </div>
  )
});

export default observer((props: IProps) => {
  const { open, onClose } = props;

  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <Main { ...props } />
    </Modal>
  );
});
