use clap::Parser;

#[derive(Parser)]
struct Cli {
    #[arg(short, long)]
    name: Option<String>,
}

fn main() {
    let cli = Cli::parse();
    println!("Hello, {}!", cli.name.unwrap_or_else(|| "world".into()));
}
