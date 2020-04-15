import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AuditListener }                                                      from './auditing/Auditing/AuditListener';

/**
 * This class is inherited by almost all database entity classes.
 */
export abstract class Base extends AuditListener {

    @PrimaryGeneratedColumn('uuid')
    public id?: string;

    @CreateDateColumn()
    public createdAt?: Date;

    @UpdateDateColumn()
    public updatedAt?: Date;

}
