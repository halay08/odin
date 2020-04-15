import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * This class is inherited by almost all database entity classes.
 */
export abstract class Base {

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn()
  public createdAt?: Date;

  @UpdateDateColumn()
  public updatedAt?: Date;

}
