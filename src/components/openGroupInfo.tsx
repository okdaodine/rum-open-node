import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { StoreProvider } from 'store';
import { IGroup } from 'apis/types';
import { GroupApi } from 'apis';
import Loading from 'components/Loading';
import { useStore } from 'store';
import Tooltip from '@material-ui/core/Tooltip';
import copy from 'copy-to-clipboard';
import Modal from 'components/Modal';
import { FaSeedling } from 'react-icons/fa';
import { BiCopy } from 'react-icons/bi';
import Button from 'components/Button';
import sleep from 'utils/sleep';

interface IModalProps {
  groupId: string
  rs: (result: boolean) => void
}

const Main = observer((props: IModalProps) => {
  const { snackbarStore, confirmDialogStore } = useStore();
  const state = useLocalObservable(() => ({
    group: {} as IGroup,
    loading: true,
    ready: false,
    open: false,
  }));

  React.useEffect(() => {
    setTimeout(() => {
      state.open = true;
    });
  }, []);
  
  React.useEffect(() => {
    (async () => {
      try {
        const group = await GroupApi.get(props.groupId);
        state.group = group;
        console.log(`[]:`, { group });
        state.ready = true;
      } catch (err) {
        console.log(err);
        snackbarStore.show({
          message: 'something wrong',
          type: 'error',
        });
      }
      state.loading = false;
    })();
  }, []);

  const handleClose = (result: any) => {
    state.open = false;
    props.rs(result);
  };

  const remove = () => {
    confirmDialogStore.show({
      content: 'Are you sure to remove?',
      ok: async () => {
        try {
          confirmDialogStore.setLoading(true);
          await GroupApi.remove(props.groupId);
          await sleep(400);
          confirmDialogStore.hide();
          handleClose('removed');
        } catch (err: any) {
          snackbarStore.show({
            message: 'something wrong',
            type: 'error',
          });
        }
      },
    });
  }

  return (
    <Modal open={state.open} onClose={() => handleClose(false)}>
      <div className="h-[90vh] overflow-y-auto  p-8 px-5 md:px-10 box-border">
        <div className="w-full md:w-[540px]">
          {state.loading && (
            <div className="py-32">
              <Loading />
            </div>
          )}
          {!state.loading && state.ready && (
            <div>
              <div className="text-18 font-bold dark:text-white dark:text-opacity-80 text-gray-700 text-center">
                <div className="flex items-center justify-center">
                  {state.group.raw.group_name}
                </div>
                <div className="mt-1 text-12 opacity-40">
                  {state.group.raw.group_id}
                </div>
              </div>
              <div className="mt-8">
                <div className="flex">
                  <div className="dark:text-white dark:text-opacity-80 text-gray-500 font-bold bg-gray-100 dark:bg-black dark:bg-opacity-70 rounded-0 pt-2 pb-3 px-4">
                    Seed
                  </div>
                </div>
                <div className="-mt-3 justify-center bg-gray-100 dark:bg-black dark:bg-opacity-70 rounded-0 pt-3 px-4 md:px-6 pb-3 leading-7 tracking-wide">
                    <Tooltip
                      enterDelay={300}
                      enterNextDelay={300}
                      placement="left"
                      title="copy"
                      arrow
                      interactive
                    >
                    <div className="flex items-center py-[2px] cursor-pointer" onClick={() => {
                      copy(state.group.seed);
                      snackbarStore.show({
                        message: 'copied',
                      });
                    }}>
                      <div className="w-[22px] h-[22px] box-border flex items-center justify-center dark:bg-white bg-black dark:text-black text-white text-12 mr-[10px] rounded-full opacity-90">
                        <FaSeedling className="text-12" />
                      </div>
                      <div className="text-12 md:text-13 text-white text-opacity-80 flex-1 pr-1 truncate">{state.group.seed}</div>
                      <BiCopy className="ml-1 text-orange-400 text-20" />
                    </div>
                  </Tooltip>
                </div>
              </div>
              <div className="mt-8">
                <div className="flex">
                  <div className="dark:text-white dark:text-opacity-80 text-gray-500 font-bold bg-gray-100 dark:bg-black dark:bg-opacity-70 rounded-0 pt-2 pb-3 px-4">
                    Info
                  </div>
                </div>
                <div className="-mt-3 justify-center bg-gray-100 dark:bg-black dark:bg-opacity-70 rounded-0 pt-3 px-4 md:px-6 pb-3 leading-7 tracking-wide text-left overflow-auto text-12">
                  <pre dangerouslySetInnerHTML={{ __html: JSON.stringify(state.group.raw, null, 2) }} />
                </div>
              </div>
              <Button className="w-full mt-8" color="red" outline onClick={remove}>移除</Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
});

export default async (groupId: string) => new Promise((rs) => {
  const div = document.createElement('div');
  document.body.append(div);
  const unmount = () => {
    unmountComponentAtNode(div);
    div.remove();
  };
  render(
    (
      <StoreProvider>
        <Main
          groupId={groupId}
          rs={(result: any) => {
            rs(result);
            setTimeout(unmount, 500);
          }}
        />
      </StoreProvider>
    ),
    div,
  );
});