export class User {
  constructor(
    public id?: number, 
    public name: string = '',
    public category: string = '',
    public price: number = 0,
    public description: string = '',
    public availability: boolean = true,
    public image: string = ''
  ) {}
}
