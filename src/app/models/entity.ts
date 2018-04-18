export class Entity {

  id: number;

  constructor(obj?: {id: number}) {
    Object.assign(this, obj);
  }

  getId(): number {
    return this.id;
  }
}
