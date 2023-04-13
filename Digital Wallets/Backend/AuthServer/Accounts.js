const store = new Map();

class Account {
    constructor(ID, Email, Password, IssuingID, IssuingName, Course, Grade, StudentID, StudentFName, StudentLName) {
        this.accountID = ID
        this.Email = Email
        this.Password = Password
        this.Profile = {
            IssuingID,
            IssuingName,
            Course,
            Grade,
            StudentID,
            StudentFName,
            StudentLName,
        };
        store.set(this.Email, this);
        store.set(this.accountID, this)
    }
  
    static async findAccountID(ID) {
      if (store.get(ID)) {return store.get(ID)}
      return undefined
    }

    static async findAccount(Email, Password) {
      if (store.get(Email) && store.get(Email).Password==Password || Password==undefined) return store.get(Email);
      return undefined;
    }

    static async InputData() {
        await new Account('000001', 's011327l@student.staffs.ac.uk', '1234', '987654', 'Staffordshire University', 'Computer Science', 'Level 5', 'S011327L', 'Owen', 'Smith')
    }
  };

export default Account;