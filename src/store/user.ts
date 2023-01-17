interface IUser {
  id: string
  avatar: string
}

export function createUserStore() {
  return {
    user: null as IUser | null,
    
    fetched: false,

    get isLogin() {
      return !!this.user
    },

    setUser(user: IUser) {
      this.user = user;
    },

    setFetched(value: boolean) {
      this.fetched = value;
    }
  };
}
