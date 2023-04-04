import React from 'react';
import Query from 'utils/query';
import store from 'store2';
import { useStore } from 'store';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { RiAddFill } from 'react-icons/ri';
import AddGroupModal from './addGroupModal';
import { GroupApi, PingApi } from 'apis';
import { IGroup } from 'apis/types';
import sleep from 'utils/sleep';
import classNames from 'classnames';
import openGroupInfo from 'components/openGroupInfo';
import { runInAction } from 'mobx';
import Button from 'components/Button';
import moment from 'moment';

export default observer(() => {
  const { snackbarStore, userStore } = useStore();
  const state = useLocalObservable(() => ({
    openAddGroupModal: false,
    loading: true,
    idSet: new Set() as Set<string>,
    map: {} as Record<string, IGroup>,
    disconnected: false,
    get groups() {
      return Array.from(this.idSet).map(id => this.map[id]);
    },
  }));

  React.useEffect(() => {
    const token = Query.get('token');
    if (token) {
      store('token', token);
      Query.remove('token');
    }
  }, []);

  React.useEffect(() => {
    (async () => {
      await sleep(300);
      try {
        const pong = await PingApi.ping();
        if (!pong) {
          state.disconnected = true;
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      await sleep(300);
      try {
        const groups = await GroupApi.list();
        runInAction(() => {
          for (const group of groups) {
            state.idSet.add(group.raw.group_id);
            state.map[group.raw.group_id] = group;
          }
        });
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

  if (state.loading) {
    return null
  }

  return (
    <div>
      <div className="fixed top-0 left-0 h-[40px] md:h-[42px] w-screen bg-white dark:bg-[#181818] border-b dark:border-white dark:md:border-opacity-10 dark:border-opacity-[0.05] border-neutral-100">
        <div className="w-[600px] mx-auto flex items-center justify-between">
          <img src="/logo.svg" alt="logo" className="w-[20px] opacity-90" />
          <div className="flex items-center">
            <a
              href="https://docs.rumsystem.net/"
              className="text-orange-400/80 px-2 text-16"
              target="_blank" rel="noreferrer">Docs</a>
            <div className="mx-4 text-white/30 text-20">
              |
            </div>
            <img
              className="rounded-full"
              title={userStore.user!.id}
              width={30}
              src={userStore.user!.avatar} alt="avatar" />
            <span className="ml-2 text-12 text-red-500/90 cursor-pointer" onClick={() => {
              store.clear();
              window.location.reload();
            }}>Sign out</span>
          </div>
        </div>
        {state.disconnected && (
          <div className="w-full bg-red-400 text-center py-1">
            Server Disconnected
          </div>
        )}
      </div>
      <div className="w-full md:w-[400px] mx-auto pt-10">
        <div className="px-4 md:px-0 py-6 md:py-12">
          {state.groups.map(group => (
            <div className="bg-white dark:bg-[#181818] rounded-full shadow-xl w-full flex justify-between items-center pt-5 pb-5 px-8 md:px-10 border border-white md:border-opacity-[0.15] leading-none mb-8" key={group.raw.group_id}>
              <div>
                <div className="flex items-center">
                  <span className="font-bold text-18 md:text-20 dark:text-white dark:text-opacity-80 text-gray-33 tracking-wider truncate max-w-[180px] md:max-w-[280px]">
                    {group.raw.group_name}
                  </span>
                </div>
                <div className="mt-[15px] flex items-center cursor-pointer text-orange-400">
                  <div className="flex items-center text-12 opacity-60">
                    Last updated at {moment(group.lastUpdated).format('yyyy-MM-DD HH:mm')}
                  </div>
                </div>
              </div>
              <Button size='small' color="orange" onClick={async () => {
                const result = await openGroupInfo(group.raw.group_id);
                if (result === 'removed') {
                  await sleep(500);
                  state.idSet.delete(group.raw.group_id);
                  delete state.map[group.raw.group_id];
                  await sleep(300);
                  snackbarStore.show({
                    message: 'removed',
                  });
                }
              }}>Open</Button>
            </div>
          ))}
          <div className={classNames({
            'w-10 h-10 mt-10': state.groups.length > 0,
            'h-12 mt-32': state.groups.length === 0
          }, "items-center justify-center mx-auto bg-orange-400 rounded-full cursor-pointer text-black hidden md:flex")} onClick={() => {
            state.openAddGroupModal = true;
          }}>
            <RiAddFill className="text-22" />
            {state.groups.length === 0 && (
              <div className="ml-2 font-bold text-18 tracking-wider">Create group</div>
            )}
          </div>

          <AddGroupModal
            open={state.openAddGroupModal}
            onClose={() => state.openAddGroupModal = false}
            addGroup={group => {
              state.idSet.add(group.raw.group_id);
              state.map[group.raw.group_id] = group;
            }}
          />
        </div>
      </div>
    </div>
  )
})
