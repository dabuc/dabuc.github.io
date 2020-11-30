在flask-sqlalchemy中使用SQLAlchemy Core的查询语法

```python
db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return '<User %r>' % self.username
  

@app.cli.command()
def initdb():
    # admin = User(username='admin', email='admin@example.com')
    # guest = User(username='guest', email='guest@example.com')
    # db.session.add(admin)
    # db.session.add(guest)
    # db.session.commit()
    row= db.session.query(User).filter(User.id==1).first()
    click.echo(row.email)

    table= db.metadata.tables.get(User.__tablename__)
    s = select([table]).where(table.c.id == 1)
    rp= db.engine.execute(s).first()
    click.echo(rp.email)
```

