import { observer } from 'mobx-react-lite';
import Button from 'components/Button';
import { API_BASE_URL } from 'apis/common';
import { AiOutlineInfoCircle } from 'react-icons/ai';

export default observer(() => (
  <div className="text-[28px] w-[1000px] mx-auto pt-20 text-white/80 ">
    <img src="/logo.svg" alt="logo" className="w-[50px] mx-auto opacity-90" />
    <div className="text-[46px] font-extrabold text-orange-400 text-center leading-tight pt-8">
      Rapidly use quorum groups <br />without running quorum node by yourself.
    </div>

    <div className="text-slate-400 mt-8 text-[22px] text-center w-[550px] mx-auto leading-normal">
      It is so easy to create groups on the open quorum node that hosted by <span className="text-orange-400/70">node.rumsystem.net</span>
    </div>

    <div className="py-3 px-4 rounded-xl opacity-50 mt-5 text-14 flex items-center leading-none justify-center">
      <AiOutlineInfoCircle className="mr-2 text-18" /> We recommend using these groups for development, not for production.
    </div>

    <div className="mt-12 flex justify-center font-bold">
      <Button size='large' onClick={() => {
          window.location.href = `${API_BASE_URL}/github/login?redirect_to=${window.location.href}`;
        }}>
        <span className="tracking-wider text-[18px] py-1">Sign in with Github</span>
      </Button>
    </div>
  </div>
))