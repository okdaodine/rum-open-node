import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import Modal from 'components/Modal';
import { TextField } from '@material-ui/core';
import Button from 'components/Button';
import { IGroup } from 'apis/types';
import { GroupApi } from 'apis';
import sleep from 'utils/sleep';
import { useStore } from 'store';
import { BiChevronDown } from 'react-icons/bi';

interface IProps {
  open: boolean
  onClose: () => void
  addGroup: (group: IGroup) => void
}

const Main = observer((props: IProps) => {
  const { snackbarStore } = useStore();
  const state = useLocalObservable(() => ({
    groupName: '',
    appKey: '',
    encryptionType: '',
    submitting: false,
    submitted: false,
    showOptions: false,
  }));
 
  const submit = async () => {
    if (state.submitting) {
      return;
    }
    state.submitting = true;
    try {
      const group = await GroupApi.create({
        groupName: state.groupName,
        appKey: state.appKey || 'group_timeline',
        encryptionType: state.encryptionType || 'public'
      });
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
      <div>
        {!state.showOptions && (
          <div className="flex justify-center">
            <div className="flex justify-center items-center mt-3 text-orange-400/50 cursor-pointer text-12" onClick={() => {
              state.showOptions = true;
            }}>
              Options <BiChevronDown className="ml-[2px] text-22" />
            </div>
          </div>
        )}
        {state.showOptions && (
          <div className="pb-3">
            <div className="pt-2">
              <TextField
                className="w-full"
                placeholder="app key"
                size="small"
                value={state.appKey}
                onChange={(e) => { state.appKey = e.target.value.trim() }}
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
            <div className="pt-2">
              <TextField
                className="w-full"
                placeholder="encryption type"
                size="small"
                value={state.encryptionType}
                onChange={(e) => { state.encryptionType = e.target.value.trim() }}
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
          </div>
        )}
      </div>
      <div className="mt-5 flex justify-center">
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
