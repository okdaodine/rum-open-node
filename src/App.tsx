import React from 'react';
import { observer } from 'mobx-react-lite';
import Welcome from './pages/Welcome';
import Groups from './pages/Groups';
import SnackBar from 'components/SnackBar';
import ConfirmDialog from './components/ConfirmDialog';
import PageLoadingModal from 'components/PageLoadingModal';
import { useStore } from 'store';
import { UserApi } from 'apis';
import store from 'store2';
import Query from 'utils/query';
import sleep from 'utils/sleep';

const App = observer(() => {
  const { userStore, modalStore } = useStore();

  React.useEffect(() => {
    modalStore.pageLoading.show();
    (async () => {
      const token = Query.get('token');
      if (token) {
        store('token', token);
        Query.remove('token');
      }
      if (store('token')) {
        try {
          const user = await UserApi.get();
          userStore.setUser(user);
          console.log(user);
        } catch (err) {
          console.log(err);
        }
      }
      userStore.setFetched(true);
      await sleep(500);
      modalStore.pageLoading.hide();
    })();
  }, []);  

  return (
    <div className="dark:bg-[#181818] bg-gray-f7 min-h-screen w-screen">

      {userStore.fetched && !userStore.isLogin && (
        <Welcome />
      )}

      {userStore.fetched && userStore.isLogin && (
        <Groups />
      )}

      <SnackBar />
      <ConfirmDialog />
      <PageLoadingModal />
    </div>
  );
});

export default App;
