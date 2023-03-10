import Tooltip from '@material-ui/core/Tooltip';
import copy from 'copy-to-clipboard';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store';

interface IProps {
  string: string
  length: number
}

export default observer((props: IProps) => {
  const { snackbarStore } = useStore();
  const { string, length } = props;

  if (!string) {
    return null;
  }

  return (
    <div onClick={() => {
      copy(string);
      snackbarStore.show({
        message: 'copy',
      });
    }}
    >
      <Tooltip
        placement="top"
        title={string + '（copy）'}
        arrow
        interactive
        enterDelay={1000}
        enterNextDelay={1000}
      >
        <div className="truncate">{`${string.slice(
          0,
          length,
        )}......${string.slice(-length)}`}</div>
      </Tooltip>
    </div>
  );
});
