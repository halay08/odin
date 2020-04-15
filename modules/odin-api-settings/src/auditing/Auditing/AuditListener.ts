import { BeforeInsert, BeforeRemove, BeforeUpdate } from 'typeorm';

export class AuditListener {

    @BeforeInsert()
    public beforeInsert() {

        console.log('AuditListener.beforeInsert', JSON.stringify(this));

    }

    @BeforeUpdate()
    public beforeUpdate() {

        console.log('AuditListener.beforeUpdate', JSON.stringify(this));

    }

    @BeforeRemove()
    public beforeRemove() {

        console.log('AuditListener.beforeRemove', JSON.stringify(this));

    }

}
