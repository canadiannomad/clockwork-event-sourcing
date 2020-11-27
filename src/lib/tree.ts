type UUID = string;
interface InputText {
  from: string;
  message: string;
  date: string;
}
interface OutputText {
  to: string;
  message: string;
  date: string;
}
interface mTurkHIT {
  HITID: string;
  question: string;
  date: string;
}
interface mTurkHITResponse {
  HITID: string;
  mTurkID: string;
  answer: string;
  date: string;
}
interface Relationship {
  from: UUID;
  to: UUID;
  corrolationScaler: number;
  dimention: string;
  qualification: string;
}

const treeCache = {};
export default class Tree {
  protected id: UUID;
  protected parent: UUID;
  protected children: UUID[] = [];
  protected mapOfMeaning: Relationship[] = [];
  protected body: InputText | OutputText | mTurkHIT | mTurkHITResponse;
  protected output: Record<string, unknown>;
  protected cost: number;
  protected beliefScaler: number;
  protected positivityScalar: number;

  // Constructor
  constructor(uuid: UUID = '') {
    if (uuid !== '') {
      this.getNode(uuid);
    }
  }
  getUUID(): UUID {
    return this.id;
  }

  getChildren(): Tree {
    return this.children.map((child) => {
      return new Tree(child);
    });
  }
  getParent(): Tree {
    return new Tree(this.parent);
  }
  getMeanings(): Relationship[] {
    return this.mapOfMeaning;
  }
  // serialize
  // unserialize
  // nextSibling
  // prevSibling
  // walkNext
  // walkPrev
  getNode(uuid: UUID): Tree {
    return treeCache[<string>uuid];
  }
  getRoot(): Tree {
    return this.getNode(<UUID>'ROOT');
  }
  getBody(): Record<string, unknown> {
    return this.body;
  }
  /* createNew(parent: UUID, body: Record<string, unknown>): Tree {
    //empty
  } */
  // saveToS3
  // addChild
  // addMeaning
  // delChild
  // delMeaning
  // isLeaf
  // nextLeaf
  // prevLeaf
}
