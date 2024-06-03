import { Module } from '@nestjs/common';
import 'dotenv/config';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Module({})
export class Neo4jModule {
  private NEO4J_URI: string = process.env.NEO4J_URI;
  private NEO4J_USERNAME: string = process.env.NEO4J_USERNAME;
  private NEO4J_PASSWORD: string = process.env.NEO4J_PASSWORD;
  private driver: Driver;

  constructor() {
    this.driver = neo4j.driver(
      this.NEO4J_URI,
      neo4j.auth.basic(this.NEO4J_USERNAME, this.NEO4J_PASSWORD),
    );
  }

  neo = (): Session => {
    return this.driver.session();
  };

  close = (): void => {
    this.driver.close();
  };
}
